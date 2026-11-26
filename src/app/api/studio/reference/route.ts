import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_REFERENCE, GenerationError, analyzeReference } from "@/lib/studio/generate";
import { getSettings } from "@/lib/studio/settings";

export const maxDuration = 60;

const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

async function fetchImage(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("image");
  const type = (res.headers.get("content-type") ?? "").split(";")[0];
  if (!TYPES.includes(type)) throw new Error("type");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) throw new Error("taille");
  return { data: buf.toString("base64"), media_type: type };
}

/** Image d'aperçu (og:image) d'un lien de post, si la page la donne. */
async function imageFromLink(link: string) {
  const res = await fetch(link, { signal: AbortSignal.timeout(10000), headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (!m) throw new Error("og");
  return fetchImage(m[1].replace(/&amp;/g, "&"));
}

// Analyse un carrousel de référence (captures ou lien) et enregistre le style « Ta référence ».
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings(userId);
  if (!settings) return NextResponse.json({ error: "Enregistre d'abord tes réglages." }, { status: 400 });
  const { urls, link, demo } = (await req.json()) as { urls?: string[]; link?: string; demo?: boolean };
  const supabase = createServerSupabaseClient();

  let style = DEMO_REFERENCE;
  if (!demo) {
    const own = `/storage/v1/object/public/studio/${userId}/`;
    let images: { data: string; media_type: string }[] = [];
    try {
      if (urls?.length) {
        images = await Promise.all(urls.filter((u) => u.includes(own)).slice(0, 6).map(fetchImage));
      } else if (link && /^https:\/\//.test(link)) {
        images = [await imageFromLink(link)];
      }
    } catch {
      images = [];
    }
    if (!images.length) {
      return NextResponse.json({ error: "Je n'arrive pas à récupérer les images de ce lien. Dépose plutôt des captures d'écran de ses slides." }, { status: 400 });
    }
    try {
      style = await analyzeReference(settings, images);
    } catch (e) {
      const message = e instanceof GenerationError ? e.message : "L'analyse n'a pas abouti.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
  const { error } = await supabase.from("studio_settings").update({ reference_style: style }).eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reference_style: style });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServerSupabaseClient();
  await supabase.from("studio_settings").update({ reference_style: null }).eq("user_id", userId);
  return NextResponse.json({ ok: true });
}
