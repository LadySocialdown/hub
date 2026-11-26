import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { StudioPublication } from "@/types/studio";

export async function getPublication(userId: string, id: string): Promise<StudioPublication | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("studio_publications").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as StudioPublication | null) ?? null;
}

export async function listPublications(userId: string, from: string, to: string): Promise<StudioPublication[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("studio_publications")
    .select("*")
    .eq("user_id", userId)
    .gte("scheduled_date", from)
    .lte("scheduled_date", to)
    .order("scheduled_date")
    .order("scheduled_time");
  if (error) throw new Error(error.message);
  return (data ?? []) as StudioPublication[];
}

/** Nombre de contenus prévus par objectif dans le mois d'une date (AAAA-MM-JJ). */
export async function monthObjectiveCounts(userId: string, date: string): Promise<Record<string, number>> {
  const [y, m] = date.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${last}`;
  const pubs = await listPublications(userId, from, to);
  const out: Record<string, number> = {};
  for (const p of pubs) out[p.planned_objective] = (out[p.planned_objective] ?? 0) + 1;
  return out;
}

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
