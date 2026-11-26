import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MONTHLY_CREDITS } from "@/lib/studio/constants";
import type { CreditBalance, CreditLedgerRow } from "@/types/studio";

export class InsufficientCreditsError extends Error {
  constructor(public needed: number, public available: number) {
    super(`Crédits insuffisants : ${needed} nécessaires, ${available} disponibles.`);
  }
}

function currentPeriod(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
}

/** Verse les 20 crédits du mois s'ils ne l'ont pas encore été (idempotent). */
export async function ensureMonthlyGrant(userId: string) {
  const supabase = createServerSupabaseClient();
  const period = currentPeriod();
  const { data } = await supabase
    .from("studio_credit_ledger")
    .select("id")
    .eq("user_id", userId)
    .eq("bucket", "mensuel")
    .eq("period", period)
    .gt("delta", 0)
    .limit(1);
  if (data && data.length) return;
  const { error } = await supabase.from("studio_credit_ledger").insert({
    user_id: userId,
    delta: MONTHLY_CREDITS,
    bucket: "mensuel",
    reason: "Crédits du mois",
    period,
    expires_at: endOfMonth(),
  });
  // 23505 : déjà versé par une requête concurrente.
  if (error && error.code !== "23505") throw new Error(error.message);
}

async function loadLedger(userId: string): Promise<CreditLedgerRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("studio_credit_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CreditLedgerRow[];
}

function computeBalance(rows: CreditLedgerRow[]) {
  const period = currentPeriod();
  const now = Date.now();
  const monthlyRows = rows.filter((r) => r.bucket === "mensuel" && r.period === period);
  const monthlyGranted = monthlyRows.filter((r) => r.delta > 0).reduce((a, r) => a + r.delta, 0);
  const monthlyUsed = -monthlyRows.filter((r) => r.delta < 0).reduce((a, r) => a + r.delta, 0);
  const lots = rows
    .filter((r) => r.bucket === "pack" && r.delta > 0 && (!r.expires_at || new Date(r.expires_at).getTime() > now))
    .map((lot) => {
      const used = -rows.filter((r) => r.lot_id === lot.id && r.delta < 0).reduce((a, r) => a + r.delta, 0);
      return { id: lot.id, remaining: Math.max(0, lot.delta - used), expires_at: lot.expires_at ?? "" };
    })
    .filter((l) => l.remaining > 0)
    .sort((a, b) => (a.expires_at < b.expires_at ? -1 : 1));
  const monthly = Math.max(0, monthlyGranted - monthlyUsed);
  const pack = lots.reduce((a, l) => a + l.remaining, 0);
  return { monthly, monthlyUsed, monthlyIncluded: monthlyGranted || MONTHLY_CREDITS, lots, pack, period };
}

export async function getBalance(userId: string): Promise<CreditBalance> {
  await ensureMonthlyGrant(userId);
  const b = computeBalance(await loadLedger(userId));
  return {
    monthly: b.monthly,
    monthlyIncluded: b.monthlyIncluded,
    monthlyUsed: b.monthlyUsed,
    pack: b.pack,
    packExpiries: b.lots.map((l) => ({ remaining: l.remaining, expires_at: l.expires_at })),
    total: b.monthly + b.pack,
  };
}

/**
 * Débite `count` crédits : d'abord ceux du mois, puis les packs les plus proches
 * de l'expiration. Lève InsufficientCreditsError si le solde ne suffit pas.
 */
export async function consumeCredits(userId: string, count: number, publicationId: string | null, reason: string) {
  if (count <= 0) return;
  await ensureMonthlyGrant(userId);
  const b = computeBalance(await loadLedger(userId));
  const available = b.monthly + b.pack;
  if (available < count) throw new InsufficientCreditsError(count, available);

  const rows: {
    user_id: string; delta: number; bucket: "mensuel" | "pack"; reason: string;
    publication_id: string | null; period?: string; lot_id?: string;
  }[] = [];
  let left = count;
  const fromMonthly = Math.min(left, b.monthly);
  if (fromMonthly > 0) {
    rows.push({ user_id: userId, delta: -fromMonthly, bucket: "mensuel", reason, publication_id: publicationId, period: b.period });
    left -= fromMonthly;
  }
  for (const lot of b.lots) {
    if (left <= 0) break;
    const take = Math.min(left, lot.remaining);
    rows.push({ user_id: userId, delta: -take, bucket: "pack", reason, publication_id: publicationId, lot_id: lot.id });
    left -= take;
  }
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("studio_credit_ledger").insert(rows);
  if (error) throw new Error(error.message);
}

/** Crédits déjà débités pour une publication. */
export async function creditsUsedFor(userId: string, publicationId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("studio_credit_ledger")
    .select("delta")
    .eq("user_id", userId)
    .eq("publication_id", publicationId);
  if (error) throw new Error(error.message);
  return -(data ?? []).filter((r) => r.delta < 0).reduce((a, r) => a + r.delta, 0);
}
