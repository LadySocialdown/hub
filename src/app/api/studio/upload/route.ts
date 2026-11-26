import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Envoi d'un fichier dans le bucket « studio », dans le dossier de l'élève.
const KINDS: Record<string, { max: number; accept: (f: File) => boolean }> = {
  logo: { max: 5 * 1024 * 1024, accept: (f) => f.type.startsWith("image/") },
  font: { max: 5 * 1024 * 1024, accept: (f) => /\.(ttf|otf|woff2?)$/i.test(f.name) },
  photo: { max: 15 * 1024 * 1024, accept: (f) => f.type.startsWith("image/") || f.type.startsWith("video/") },
  reference: { max: 10 * 1024 * 1024, accept: (f) => f.type.startsWith("image/") },
  export: { max: 15 * 1024 * 1024, accept: (f) => f.type === "image/png" },
};

const FONT_TYPES: Record<string, string> = { ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2" };

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "");
  const file = form.get("file");
  const rule = KINDS[kind];
  if (!rule || !(file instanceof File)) return NextResponse.json({ error: "Fichier ou type manquant." }, { status: 400 });
  if (!rule.accept(file)) return NextResponse.json({ error: "Ce type de fichier n'est pas accepté." }, { status: 400 });
  if (file.size > rule.max) return NextResponse.json({ error: "Ce fichier est trop lourd." }, { status: 400 });

  const safe = file.name.normalize("NFD").replace(/[^\w.-]+/g, "-").slice(-80) || "fichier";
  const path = `${userId}/${kind}/${Date.now()}-${safe}`;
  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  const contentType = kind === "font" ? FONT_TYPES[ext] ?? "application/octet-stream" : file.type;

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.storage.from("studio").upload(path, file, { contentType, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = supabase.storage.from("studio").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, name: file.name });
}
