import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureMonthlyGrant } from "@/lib/studio/credits";

// Verse les 20 crédits du mois à chaque élève du studio. Idempotent : peut être
// appelé chaque jour, un seul versement par mois et par élève. Le solde est aussi
// complété à la première visite du mois, si ce cron n'est pas planifié.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("studio_settings").select("user_id");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let granted = 0;
  for (const row of data ?? []) {
    try {
      await ensureMonthlyGrant(row.user_id);
      granted++;
    } catch (e) {
      console.error("[studio] versement mensuel impossible", row.user_id, e);
    }
  }
  return NextResponse.json({ ok: true, users: granted });
}
