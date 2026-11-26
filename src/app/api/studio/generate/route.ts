import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InsufficientCreditsError, consumeCredits, getBalance } from "@/lib/studio/credits";
import { GenerationError, generateCarousel, generateStory } from "@/lib/studio/generate";
import { getPublication } from "@/lib/studio/publications";
import { getSettings } from "@/lib/studio/settings";

export const maxDuration = 60;

/** Nombre de crédits nécessaires pour générer un contenu. */
function cost(format: string, frames: number) {
  return format === "story" ? frames : 1;
}

// Génère un contenu « à créer » : carrousel (1 crédit) ou story (1 crédit par visuel).
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, frames: wanted } = (await req.json()) as { id: string; frames?: number };
  const pub = await getPublication(userId, id);
  if (!pub) return NextResponse.json({ error: "Contenu introuvable." }, { status: 404 });
  if (pub.format === "reel") return NextResponse.json({ error: "Les Reels arrivent bientôt." }, { status: 400 });
  if (pub.status !== "a_creer") return NextResponse.json({ error: "Ce contenu est déjà créé." }, { status: 409 });
  const settings = await getSettings(userId);
  if (!settings) return NextResponse.json({ error: "Enregistre d'abord tes réglages." }, { status: 400 });

  const frameCount = Math.min(8, Math.max(1, Number(wanted) || 3));
  const needed = cost(pub.format, frameCount);
  const balance = await getBalance(userId);
  if (balance.total < needed) {
    return NextResponse.json({ error: "credits", needed, available: balance.total }, { status: 402 });
  }

  try {
    const supabase = createServerSupabaseClient();
    if (pub.format === "carrousel") {
      const out = await generateCarousel(pub, settings);
      await consumeCredits(userId, 1, pub.id, "Carrousel");
      const { error } = await supabase
        .from("studio_publications")
        .update({
          content: { slides: out.slides },
          caption: out.caption,
          hashtags: out.hashtags,
          alt_text: out.alt_text,
          hook: pub.hook || out.slides[0]?.title || "",
          cta: pub.cta || out.slides[out.slides.length - 1]?.title || "",
          status: "a_relire",
          updated_at: new Date().toISOString(),
        })
        .eq("id", pub.id);
      if (error) throw new Error(error.message);
    } else {
      const out = await generateStory(pub, settings, frameCount);
      await consumeCredits(userId, out.frames.length, pub.id, `Story (${out.frames.length} visuels)`);
      const { error } = await supabase
        .from("studio_publications")
        .update({ content: { frames: out.frames }, status: "a_relire", updated_at: new Date().toISOString() })
        .eq("id", pub.id);
      if (error) throw new Error(error.message);
    }
    return NextResponse.json({ ok: true, publication: await getPublication(userId, pub.id), balance: await getBalance(userId) });
  } catch (e) {
    if (e instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: "credits", needed: e.needed, available: e.available }, { status: 402 });
    }
    const message = e instanceof GenerationError ? e.message : "La création n'a pas abouti. Réessaie dans un instant.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
