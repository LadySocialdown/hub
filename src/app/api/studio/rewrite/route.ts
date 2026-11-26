import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FREE_REWRITES } from "@/lib/studio/constants";
import { GenerationError, rewriteFrame, rewriteSlide } from "@/lib/studio/generate";
import { getPublication } from "@/lib/studio/publications";
import { getSettings } from "@/lib/studio/settings";
import type { Slide, StoryFrame } from "@/types/studio";

export const maxDuration = 60;

// Réécrit une seule slide (ou un seul visuel de story). 2 réécritures gratuites par contenu.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, index, items } = (await req.json()) as { id: string; index: number; items: (Slide | StoryFrame)[] };
  const pub = await getPublication(userId, id);
  if (!pub) return NextResponse.json({ error: "Contenu introuvable." }, { status: 404 });
  if (pub.rewrites_used >= FREE_REWRITES) return NextResponse.json({ error: "Tu as utilisé tes réécritures pour ce contenu." }, { status: 403 });
  if (!Array.isArray(items) || index < 0 || index >= items.length) return NextResponse.json({ error: "Slide introuvable." }, { status: 400 });
  const settings = await getSettings(userId);
  if (!settings) return NextResponse.json({ error: "Enregistre d'abord tes réglages." }, { status: 400 });

  try {
    const item =
      pub.format === "story"
        ? await rewriteFrame(pub, settings, items as StoryFrame[], index)
        : await rewriteSlide(pub, settings, items as Slide[], index);
    const supabase = createServerSupabaseClient();
    await supabase.from("studio_publications").update({ rewrites_used: pub.rewrites_used + 1 }).eq("id", pub.id);
    return NextResponse.json({ item, rewrites_used: pub.rewrites_used + 1 });
  } catch (e) {
    const message = e instanceof GenerationError ? e.message : "La réécriture n'a pas abouti.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
