import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { KPIS, OBJECTIVES } from "@/lib/studio/constants";
import { getSettings } from "@/lib/studio/settings";

// Création d'un contenu spontané (en attendant le cahier de bord).
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings(userId);
  if (!settings) return NextResponse.json({ error: "Enregistre d'abord tes réglages." }, { status: 400 });

  const b = (await req.json()) as Record<string, string>;
  const format = b.format === "story" ? "story" : "carrousel";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date ?? "")) return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  const objective = (OBJECTIVES as readonly string[]).includes(b.objective) ? b.objective : OBJECTIVES[0];
  const title = String(b.title ?? "").trim().slice(0, 140);
  if (!title) return NextResponse.json({ error: "Donne un titre à ton contenu." }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("studio_publications")
    .insert({
      user_id: userId,
      scheduled_date: b.date,
      scheduled_time: /^\d{1,2}:\d{2}$/.test(b.time ?? "") ? b.time : settings.preferred_time,
      format,
      platforms: settings.networks.length ? settings.networks : ["Instagram"],
      pillar: settings.pillars.some((p) => p.name === b.pillar) ? b.pillar : settings.pillars[0]?.name ?? "",
      objective,
      planned_objective: objective,
      kpi: KPIS[objective],
      title,
      hook: String(b.hook ?? "").slice(0, 140),
      cta: String(b.cta ?? "").slice(0, 140),
      style: settings.default_style,
      source: "spontane",
      status: "a_creer",
    })
    .select("id, format")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
