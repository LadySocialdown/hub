import { NextResponse } from "next/server";
import { runDueAnalyses } from "@/lib/instagram/scheduler";

// Appelé une fois par jour par Vercel Cron (voir vercel.json) pour vérifier si une
// échéance J+7/15/21/30 est due et lancer l'analyse automatiquement. Windsor.ai + Claude
// peuvent prendre du temps : voir maxDuration ci-dessous et le plan Vercel utilisé.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[instagram] CRON_SECRET non configuré — cron refusé");
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await runDueAnalyses();
    return NextResponse.json({ ok: true, reportsGenerated: reports.length });
  } catch (error) {
    console.error("[instagram] échec du cycle planifié, nouvelle tentative demain", error);
    return NextResponse.json({ ok: false, error: "Échec de l'analyse planifiée" }, { status: 500 });
  }
}
