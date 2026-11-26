import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BODY_FONTS, NETWORKS, TITLE_FONTS } from "@/lib/studio/constants";
import type { StudioSettings } from "@/types/studio";

const HEX = /^#[0-9a-fA-F]{6}$/;
const STYLES = ["doux", "edito", "magazine", "minimal", "ref"];

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = (await req.json()) as Partial<StudioSettings>;
  const custom = Array.isArray(b.custom_fonts)
    ? b.custom_fonts.filter((f) => f && typeof f.name === "string" && typeof f.url === "string").slice(0, 10)
    : [];
  const customNames = custom.map((f) => f.name);
  const colors = b.colors ?? { principale: "", accent: "", fond: "", detail: "" };
  const pillars = Array.isArray(b.pillars) ? b.pillars : [];

  if (![colors.principale, colors.accent, colors.fond, colors.detail].every((c) => HEX.test(c))) {
    return NextResponse.json({ error: "Couleurs invalides." }, { status: 400 });
  }
  if (pillars.length < 3 || pillars.length > 5 || pillars.some((p) => !p.name?.trim() || !HEX.test(p.color))) {
    return NextResponse.json({ error: "Il faut entre 3 et 5 piliers, chacun avec un nom et une couleur." }, { status: 400 });
  }
  const fontTitle = String(b.font_title ?? "");
  const fontBody = String(b.font_body ?? "");
  if (![...TITLE_FONTS, ...customNames].includes(fontTitle) || ![...BODY_FONTS, ...customNames].includes(fontBody)) {
    return NextResponse.json({ error: "Police inconnue." }, { status: 400 });
  }

  const row = {
    user_id: userId,
    activity: String(b.activity ?? "").slice(0, 300),
    audience: String(b.audience ?? "").slice(0, 300),
    handle: String(b.handle ?? "").replace(/^@/, "").slice(0, 60),
    tone: String(b.tone ?? "").slice(0, 120),
    logo_url: typeof b.logo_url === "string" && b.logo_url ? b.logo_url : null,
    show_logo_on_cover: b.show_logo_on_cover !== false,
    colors,
    font_title: fontTitle,
    font_body: fontBody,
    custom_fonts: custom,
    default_style: STYLES.includes(String(b.default_style)) ? (b.default_style as StudioSettings["default_style"]) : "doux",
    pillars: pillars.map((p) => ({ name: p.name.trim().slice(0, 40), description: String(p.description ?? "").slice(0, 120), color: p.color })),
    networks: (b.networks ?? []).filter((n) => NETWORKS.includes(n)),
    posts_per_week: Math.min(14, Math.max(1, Number(b.posts_per_week) || 5)),
    preferred_time: String(b.preferred_time ?? "18:00").slice(0, 5),
    updated_at: new Date().toISOString(),
  };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("studio_settings").upsert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
