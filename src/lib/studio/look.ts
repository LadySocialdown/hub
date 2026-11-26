// Calcul du rendu des contenus de l'élève (slides, stories, vignettes) à partir
// de sa charte. Reprend à l'identique les règles des maquettes CarrouselV2 et
// StoryV2, en remplaçant les couleurs de démonstration par celles de l'élève.
import type { CSSProperties } from "react";
import { fontStack } from "@/lib/studio/constants";
import type { SlideTone, StudioSettings, StudioStyleId } from "@/types/studio";

export type Look = Pick<StudioSettings, "colors" | "font_title" | "font_body" | "handle" | "logo_url" | "show_logo_on_cover" | "reference_style">;

type StyleRule = {
  radius: number;
  up: boolean;
  /** Titre en police de titre (serif) ou en police de texte. */
  titleFont: "title" | "body";
  titleWeight: number;
  italic: boolean;
  letterSpacing?: string;
};

export const STYLE_RULES: Record<StudioStyleId, StyleRule> = {
  doux: { radius: 16, up: false, titleFont: "title", titleWeight: 700, italic: false },
  edito: { radius: 4, up: false, titleFont: "title", titleWeight: 600, italic: true },
  magazine: { radius: 0, up: true, titleFont: "body", titleWeight: 700, italic: false, letterSpacing: "0.02em" },
  minimal: { radius: 10, up: false, titleFont: "body", titleWeight: 500, italic: false },
  ref: { radius: 2, up: false, titleFont: "title", titleWeight: 600, italic: false, letterSpacing: "-0.01em" },
};

export function refColors(look: Look) {
  const r = look.reference_style;
  return {
    background: r?.background ?? "#F3E7DF",
    text: r?.text ?? "#3E2A24",
    accent: r?.accent ?? look.colors.detail,
  };
}

/** Rayon du style « Ta référence » s'il a été analysé, sinon celui de la maquette. */
export function styleRule(style: StudioStyleId, look: Look): StyleRule {
  const base = STYLE_RULES[style] ?? STYLE_RULES.doux;
  if (style !== "ref" || !look.reference_style) return base;
  const r = look.reference_style;
  return {
    ...base,
    radius: r.radius,
    up: r.titleUppercase,
    italic: r.titleItalic,
  };
}

// ---------- Lisibilité ----------

function rgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const c = rgb(hex);
  if (!c) return 0.5;
  const [r, g, b] = c.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Garde la couleur voulue si elle se lit sur le fond, sinon prend la plus lisible de la charte. */
export function readable(bg: string, wanted: string, look: Look, min = 3): string {
  if (contrast(bg, wanted) >= min) return wanted;
  const c = look.colors;
  const pool = [c.principale, c.detail, c.fond, c.accent, "#1A1410", "#FFFFFF"];
  return pool.reduce((best, x) => (contrast(bg, x) > contrast(bg, best) ? x : best), pool[0]);
}

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

type ColorOverride = { bg_color?: string | null; text_color?: string | null } | undefined;

/** [fond, texte, accent] d'une slide, avec les couleurs choisies par l'élève et un texte toujours lisible. */
export function slideTones(style: StudioStyleId, tone: SlideTone, look: Look, o?: ColorOverride): [string, string, string] {
  const [b0, f0, a0] = baseSlideTones(style, tone, look);
  const bg = isHex(o?.bg_color) ? o!.bg_color! : b0;
  const fg = readable(bg, isHex(o?.text_color) ? o!.text_color! : f0, look);
  const accent = readable(bg, a0, look, 2);
  return [bg, fg, accent];
}

function baseSlideTones(style: StudioStyleId, tone: SlideTone, look: Look): [string, string, string] {
  const c = look.colors;
  if (style === "minimal") return ["#FFFFFF", c.principale, c.detail];
  if (style === "magazine") return tone === "light" ? [c.fond, c.principale, c.detail] : [c.principale, c.fond, c.accent];
  if (style === "ref") {
    const r = refColors(look);
    return tone === "dark" ? [r.accent, c.fond, c.accent] : [r.background, r.text, r.accent];
  }
  if (style === "edito") return tone === "dark" ? [c.accent, c.principale, c.principale] : [c.fond, c.principale, c.detail];
  return {
    dark: [c.principale, c.fond, c.accent] as [string, string, string],
    light: [c.fond, c.principale, c.detail] as [string, string, string],
    pink: [c.accent, c.principale, c.principale] as [string, string, string],
  }[tone];
}

/** [fond, texte] d'un visuel de story, avec les couleurs choisies et un texte toujours lisible. */
export function storyTones(style: StudioStyleId, tone: SlideTone, look: Look, o?: ColorOverride): [string, string] {
  const c = look.colors;
  const base = (style === "minimal" ? ["#FFFFFF", c.principale] : { dark: [c.principale, c.fond], pink: [c.accent, c.principale], light: [c.fond, c.principale] }[tone]) as [string, string];
  const bg = isHex(o?.bg_color) ? o!.bg_color! : base[0];
  return [bg, readable(bg, isHex(o?.text_color) ? o!.text_color! : base[1], look)];
}

/** Couleur la plus foncée de la charte (pour les fonds « photo »). */
export function darkest(look: Look): string {
  const c = look.colors;
  return [c.principale, c.detail, c.accent, c.fond].reduce((d, x) => (luminance(x) < luminance(d) ? x : d));
}

export function titleCss(style: StudioStyleId, look: Look, size: number): CSSProperties {
  const r = styleRule(style, look);
  return {
    fontFamily: fontStack(r.titleFont === "title" ? look.font_title : look.font_body),
    fontWeight: r.titleWeight,
    fontStyle: r.italic ? "italic" : undefined,
    textTransform: r.up ? "uppercase" : undefined,
    letterSpacing: r.letterSpacing,
    fontSize: size,
    lineHeight: 1.05,
  };
}

export function bodyFont(look: Look): string {
  return fontStack(look.font_body);
}

/** Pastille de style (carte de choix du style). */
export function styleSwatch(style: StudioStyleId, look: Look): { bg: string; fg: string } {
  const c = look.colors;
  const bg = { doux: c.fond, edito: c.accent, magazine: c.principale, minimal: "#FFFFFF", ref: refColors(look).background }[style];
  return { bg, fg: readable(bg, bg === c.principale ? c.fond : c.principale, look) };
}

/** Fond plein d'un visuel « photo » sans image (dégradé de la maquette, à la charte). */
export function photoGradient(look: Look): string {
  const d = darkest(look);
  return `linear-gradient(180deg, color-mix(in srgb, ${d} 80%, white), ${d})`;
}
