/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { LAYOUTS } from "@/lib/studio/constants";
import { INSTA } from "@/lib/studio/theme";
import { bodyFont, slideTones, styleRule, titleCss, type Look } from "@/lib/studio/look";
import type { Slide, StudioStyleId } from "@/types/studio";

export type SlideVariant = "editor" | "insta" | "export";

/**
 * Une slide de carrousel, à la charte de l'élève. Largeur de référence : 360 px
 * (export en 1080 × 1350 avec un facteur 3).
 */
export function SlideView({
  slide,
  index,
  total,
  style,
  look,
  variant = "editor",
  ctaLabel = "Enregistre ce post",
}: {
  slide: Slide;
  index: number;
  total: number;
  style: StudioStyleId;
  look: Look;
  variant?: SlideVariant;
  ctaLabel?: string;
}) {
  const rule = styleRule(style, look);
  const t = slideTones(style, slide.tone, look);
  const lay = slide.layout;
  const big = lay === "cover" || lay === "cta" || lay === "text" || lay === "quote";
  const titleSize = lay === "cover" ? (rule.up ? 30 : 38) : big ? (rule.up ? 26 : 34) : rule.up ? 20 : 28;
  const hasImg = !!slide.photo_url;
  const showPhoto = (lay === "cover" || lay === "photo") && (hasImg || !!slide.photo_label);
  const items = (slide.body || "").split("\n").filter((x) => x.trim());
  const showLogo = variant !== "insta" && index === 0 && lay === "cover" && !!look.logo_url && look.show_logo_on_cover;

  const box: CSSProperties = {
    position: "relative",
    width: variant === "export" ? 360 : "100%",
    maxWidth: variant === "insta" ? "none" : 360,
    aspectRatio: "4 / 5",
    boxSizing: "border-box",
    padding: "28px 26px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflow: "hidden",
    borderRadius: variant === "insta" || variant === "export" ? 0 : rule.radius,
    boxShadow: variant === "editor" ? "0 10px 30px rgba(47,74,58,0.18)" : "none",
    background: t[0],
    color: t[1],
    fontFamily: bodyFont(look),
    justifyContent: lay === "cta" || lay === "quote" || lay === "text" ? "center" : undefined,
    borderTop: style === "edito" ? `1px solid ${t[2]}` : undefined,
  };

  return (
    <div style={box}>
      {showLogo && (
        <img src={look.logo_url!} alt="" crossOrigin="anonymous" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,0.85)" }} />
      )}
      {!!slide.kicker && (
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t[2] }}>{slide.kicker}</span>
      )}
      {lay === "quote" && (
        <span aria-hidden="true" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, lineHeight: 0.6, color: t[2] }}>“</span>
      )}
      <span style={{ ...titleCss(style, look, titleSize), whiteSpace: "pre-line" }}>{slide.title}</span>
      {showPhoto && (
        <div
          style={{
            flex: 1,
            minHeight: 110,
            borderRadius: Math.max(0, rule.radius - 4),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: hasImg ? 0 : 12,
            fontSize: 13,
            overflow: "hidden",
            border: hasImg ? "none" : `1px dashed ${t[2]}`,
            background: t[0] === look.colors.principale ? "rgba(251,247,240,0.08)" : "rgba(47,74,58,0.06)",
          }}
        >
          {hasImg ? (
            <img src={slide.photo_url!} alt={slide.photo_label || "Photo de la slide"} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
          ) : (
            <span>{slide.generated ? "Visuel généré : " : "Ta photo : "}{slide.photo_label}</span>
          )}
        </div>
      )}
      {lay === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((text, k) => (
            <span key={k} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 16, fontWeight: 500 }}>
              <span style={{ flex: "none", width: 26, height: 26, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: t[1], color: t[0] }}>{k + 1}</span>
              {text}
            </span>
          ))}
        </div>
      )}
      {lay !== "list" && !!slide.body && (
        <span style={{ fontSize: 15, lineHeight: 1.45, opacity: 0.92, whiteSpace: "pre-line" }}>{slide.body}</span>
      )}
      {lay === "cta" && (
        <span style={{ alignSelf: "flex-start", padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 700, background: t[1], color: t[0] }}>{ctaLabel}</span>
      )}
      <span style={{ position: "absolute", left: 26, right: 26, bottom: 14, display: "flex", justifyContent: "flex-end", fontSize: 11, letterSpacing: "0.06em", opacity: 0.75 }}>
        {variant === "insta" ? `${index + 1} / ${total}` : `${look.handle ? "@" + look.handle + " · " : ""}${index + 1} / ${total}`}
      </span>
    </div>
  );
}

/** Vignette de la bande « Toutes tes slides » (88 px). */
export function SlideThumb({ slide, n, style, look, on, onClick }: { slide: Slide; n: number; style: StudioStyleId; look: Look; on: boolean; onClick: () => void }) {
  const rule = styleRule(style, look);
  const tt = slideTones(style, slide.tone, look);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={`Slide ${n}`}
      style={{
        flex: "none", width: 88, aspectRatio: "4 / 5", boxSizing: "border-box", padding: 7, display: "flex", flexDirection: "column", gap: 3,
        textAlign: "left", overflow: "hidden", borderRadius: Math.min(rule.radius, 10), background: tt[0], color: tt[1],
        border: on ? `3px solid ${look.colors.fond}` : "3px solid transparent", boxShadow: on ? "0 0 0 2px var(--mocha)" : undefined,
        fontFamily: bodyFont(look),
      }}
    >
      <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: tt[2] }}>{slide.kicker}</span>
      <span style={titleCss(style, look, rule.up ? 9 : 11)}>{slide.title}</span>
      <span style={{ marginTop: "auto", alignSelf: "flex-end", fontSize: 9, fontWeight: 700, opacity: 0.75 }}>{n}</span>
    </button>
  );
}

/** Cadre « Vue Instagram » autour de la slide. */
export function InstaPost({ children, look, dots, sel, caption }: { children: React.ReactNode; look: Look; dots: number; sel: number; caption: string }) {
  const first = caption.split("\n")[0].slice(0, 90);
  return (
    <div className="w-full max-w-[340px] overflow-hidden rounded-[28px] border border-[var(--mocha-light)] bg-white" style={{ boxShadow: "0 10px 30px rgba(90,62,54,0.12)" }}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span aria-hidden="true" className="h-7 w-7 rounded-full" style={{ background: look.colors.principale, border: `2px solid ${look.colors.accent}` }} />
        <span className="text-[13px] font-bold" style={{ color: INSTA.text }}>{look.handle || "ton.compte"}</span>
      </div>
      <div className="relative">{children}</div>
      <div className="flex justify-center gap-1 py-2" aria-hidden="true">
        {Array.from({ length: dots }, (_, k) => (
          <span key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: k === sel ? INSTA.blue : INSTA.dotOff }} />
        ))}
      </div>
      <div className="px-3 pb-3.5 text-[13px] leading-[1.4]" style={{ color: INSTA.text }}>
        <strong>{look.handle || "ton.compte"}</strong> {first}… plus
      </div>
    </div>
  );
}

export const LAYOUT_NAME = Object.fromEntries(LAYOUTS.map((l) => [l.id, l.name])) as Record<string, string>;
