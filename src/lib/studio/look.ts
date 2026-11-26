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

/** [fond, texte, accent] d'une slide. */
export function slideTones(style: StudioStyleId, tone: SlideTone, look: Look): [string, string, string] {
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

/** [fond, texte] d'un visuel de story. */
export function storyTones(style: StudioStyleId, tone: SlideTone, look: Look): [string, string] {
  const c = look.colors;
  if (style === "minimal") return ["#FFFFFF", c.principale];
  return { dark: [c.principale, c.fond], pink: [c.accent, c.principale], light: [c.fond, c.principale] }[tone] as [string, string];
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
  return { bg, fg: bg === c.principale ? c.fond : c.principale };
}

/** Fond plein d'un visuel « photo » sans image (dégradé de la maquette, à la charte). */
export function photoGradient(look: Look): string {
  return `linear-gradient(180deg, color-mix(in srgb, ${look.colors.principale} 80%, white), ${look.colors.principale})`;
}
