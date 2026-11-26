import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { KPIS, MAX_FRAMES, MAX_SLIDES, OBJECTIVES } from "@/lib/studio/constants";
import { InsufficientCreditsError, consumeCredits, creditsUsedFor } from "@/lib/studio/credits";
import { cleanFrame, cleanSlide } from "@/lib/studio/generate";
import { getPublication } from "@/lib/studio/publications";
import type { StudioPublication } from "@/types/studio";

const STYLES = ["doux", "edito", "magazine", "minimal", "ref"];
const STATUSES = ["a_creer", "a_relire", "cree", "programme", "publie"];

// Enregistrement des modifications de l'élève (gratuites et illimitées).
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const pub = await getPublication(userId, id);
  if (!pub) return NextResponse.json({ error: "Contenu introuvable." }, { status: 404 });

  const b = (await req.json()) as Partial<StudioPublication>;
  const patch: Partial<StudioPublication> = { updated_at: new Date().toISOString() };
  if (typeof b.caption === "string") patch.caption = b.caption.slice(0, 2200);
  if (typeof b.hashtags === "string") patch.hashtags = b.hashtags.slice(0, 300);
  if (typeof b.alt_text === "string") patch.alt_text = b.alt_text.slice(0, 300);
  if (typeof b.hook === "string") patch.hook = b.hook.slice(0, 140);
  if (typeof b.cta === "string") patch.cta = b.cta.slice(0, 140);
  if (typeof b.style === "string" && STYLES.includes(b.style)) patch.style = b.style;
  if (typeof b.objective === "string" && (OBJECTIVES as readonly string[]).includes(b.objective)) {
    patch.objective = b.objective;
    patch.kpi = KPIS[b.objective];
  }
  if (b.content && pub.status !== "a_creer") {
    if (pub.format === "carrousel" && Array.isArray(b.content.slides)) {
      const slides = b.content.slides.slice(0, MAX_SLIDES).map((s) => cleanSlide(s as unknown as Record<string, unknown>, s));
      patch.content = { slides };
    } else if (pub.format === "story" && Array.isArray(b.content.frames)) {
      const frames = b.content.frames.slice(0, MAX_FRAMES).map((f) => cleanFrame(f as unknown as Record<string, unknown>, f));
      patch.content = { frames };
    }
  }
  if (Array.isArray(b.export_urls)) patch.export_urls = b.export_urls.filter((u) => typeof u === "string").slice(0, 10);
  if (typeof b.status === "string" && STATUSES.includes(b.status) && pub.status !== "a_creer") patch.status = b.status;

  // Story : chaque visuel ajouté après la création consomme 1 crédit, à la validation.
  if (patch.status === "programme" && pub.format === "story") {
    const frames = (patch.content?.frames ?? pub.content.frames ?? []).length;
    const extra = frames - (await creditsUsedFor(userId, pub.id));
    if (extra > 0) {
      try {
        await consumeCredits(userId, extra, pub.id, `Story (${extra} visuel${extra > 1 ? "s" : ""} ajouté${extra > 1 ? "s" : ""})`);
      } catch (e) {
        if (e instanceof InsufficientCreditsError) {
          return NextResponse.json({ error: "credits", needed: e.needed, available: e.available }, { status: 402 });
        }
        throw e;
      }
    }
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("studio_publications").update(patch).eq("id", id).eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
