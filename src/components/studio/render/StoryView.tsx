/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { INSTA } from "@/lib/studio/theme";
import { bodyFont, photoGradient, storyTones, titleCss, type Look } from "@/lib/studio/look";
import type { StoryFrame, StudioStyleId } from "@/types/studio";

/**
 * Un visuel de story à la charte. Largeur de référence : 270 px
 * (export en 1080 × 1920 avec un facteur 4, sans l'habillage Instagram).
 */
export function StoryView({
  frame,
  index,
  total,
  style,
  look,
  variant = "editor",
  vote,
  onVote,
}: {
  frame: StoryFrame;
  index: number;
  total: number;
  style: StudioStyleId;
  look: Look;
  variant?: "editor" | "export";
  vote?: number;
  onVote?: (k: number) => void;
}) {
  const tc = storyTones(style, frame.tone, look);
  const isPhotoBg = frame.bg === "photo" || frame.bg === "gen";
  const hasImg = frame.bg === "photo" && !!frame.photo_url;
  const exp = variant === "export";
  const shadow = isPhotoBg ? "0 2px 10px rgba(0,0,0,0.35)" : undefined;

  const box: CSSProperties = {
    position: "relative",
    width: exp ? 270 : "100%",
    maxWidth: 270,
    aspectRatio: "9 / 16",
    borderRadius: exp ? 0 : 18,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: exp ? "none" : "0 10px 30px rgba(47,74,58,0.2)",
    background: isPhotoBg ? photoGradient(look) : tc[0],
    color: isPhotoBg ? look.colors.fond : tc[1],
    fontFamily: bodyFont(look),
  };
  const sticker: CSSProperties = { background: "#FFFFFF", borderRadius: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" };
  const opts = [frame.opt_a || "Réponse 1", frame.opt_b || "Réponse 2"];

  return (
    <div style={box}>
      {hasImg && <img src={frame.photo_url!} alt="Fond de la story" crossOrigin="anonymous" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {isPhotoBg && !hasImg && (
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 30, fontSize: 12, opacity: 0.7 }}>
          {frame.bg === "gen" ? "Visuel généré : " + (frame.photo_label || frame.title) : "Ta photo : " + (frame.photo_label || "à ajouter")}
        </span>
      )}
      {!exp && (
        <>
          <div aria-hidden="true" style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", gap: 3 }}>
            {Array.from({ length: total }, (_, k) => (
              <span key={k} style={{ flex: 1, height: 2, borderRadius: 999, background: k <= index ? "#FFFFFF" : "rgba(255,255,255,0.4)" }} />
            ))}
          </div>
          <div style={{ position: "absolute", top: 22, left: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#FFFFFF", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}>
            <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 999, background: look.colors.principale, border: `2px solid ${look.colors.accent}` }} />
            {look.handle || "ton.compte"}
          </div>
        </>
      )}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10, marginTop: "auto", marginBottom: "auto", padding: "0 18px" }}>
        {!!frame.title && <span style={{ ...titleCss(style, look, style === "magazine" ? 24 : 30), textAlign: "center", textShadow: shadow, whiteSpace: "pre-line" }}>{frame.title}</span>}
        {!!frame.sub && <span style={{ fontSize: 14, textAlign: "center", opacity: 0.9, textShadow: isPhotoBg ? "0 1px 6px rgba(0,0,0,0.35)" : undefined }}>{frame.sub}</span>}

        {frame.sticker === "poll" && (
          <div style={{ ...sticker, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {opts.map((label, k) => {
              const w = vote === undefined ? 0 : k === vote ? 64 : 36;
              return (
                <button
                  key={k}
                  type="button"
                  tabIndex={exp ? -1 : 0}
                  onClick={() => onVote?.(k)}
                  style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 8, minHeight: 36, padding: "0 12px", borderRadius: 10, border: `1px solid ${INSTA.border}`, background: "#FFFFFF", color: INSTA.text, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: onVote ? "pointer" : "default" }}
                >
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${w}%`, background: `color-mix(in srgb, ${look.colors.accent} 45%, transparent)`, transition: "width 300ms ease" }} />
                  <span style={{ position: "relative", flex: 1, textAlign: "left" }}>{label}</span>
                  <span style={{ position: "relative" }}>{vote === undefined ? "" : k === vote ? "64 %" : "36 %"}</span>
                </button>
              );
            })}
          </div>
        )}
        {frame.sticker === "question" && (
          <div style={{ ...sticker, overflow: "hidden", textAlign: "center" }}>
            <div style={{ padding: 10, fontSize: 13, fontWeight: 700, color: "#FFFFFF", background: look.colors.detail }}>{frame.sticker_text}</div>
            <div style={{ padding: 10, fontSize: 12, color: INSTA.muted }}>Écris quelque chose…</div>
          </div>
        )}
        {frame.sticker === "quiz" && (
          <div style={{ ...sticker, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INSTA.text, textAlign: "center" }}>{frame.sticker_text}</span>
            {opts.map((q, k) => (
              <span key={k} style={{ padding: "6px 10px", borderRadius: 999, border: `1px solid ${INSTA.border}`, fontSize: 12, color: INSTA.text }}>{q}</span>
            ))}
          </div>
        )}
        {frame.sticker === "countdown" && (
          <div style={{ ...sticker, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INSTA.text }}>{frame.sticker_text}</div>
            <div style={{ ...titleCss("doux", look, 30), color: look.colors.detail }}>J-14</div>
          </div>
        )}
        {frame.sticker === "link" && (
          <span style={{ ...sticker, alignSelf: "center", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, color: INSTA.link, fontSize: 13, fontWeight: 700 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
            {frame.sticker_text}
          </span>
        )}
      </div>
      {!exp && (
        <div aria-hidden="true" style={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ flex: 1, height: 34, borderRadius: 999, border: "1px solid rgba(255,255,255,0.7)", color: "rgba(255,255,255,0.9)", fontSize: 11, display: "flex", alignItems: "center", padding: "0 12px" }}>Envoyer un message</span>
        </div>
      )}
    </div>
  );
}

/** Vignette de la bande « Ta séquence de stories » (64 px). */
export function StoryThumb({ frame, n, style, look, on, onClick, stickerName }: { frame: StoryFrame; n: number; style: StudioStyleId; look: Look; on: boolean; onClick: () => void; stickerName: string }) {
  const photo = frame.bg === "photo" || frame.bg === "gen";
  const c = photo ? [`color-mix(in srgb, ${look.colors.principale} 85%, white)`, look.colors.fond] : storyTones(style, frame.tone, look);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={`Visuel ${n}`}
      style={{
        flex: "none", width: 64, aspectRatio: "9 / 16", boxSizing: "border-box", padding: 6, display: "flex", flexDirection: "column", gap: 3,
        textAlign: "left", overflow: "hidden", borderRadius: 8, background: c[0], color: c[1], fontFamily: bodyFont(look),
        border: on ? `3px solid ${look.colors.fond}` : "3px solid transparent", boxShadow: on ? "0 0 0 2px var(--mocha)" : undefined,
      }}
    >
      <span style={titleCss(style, look, 9)}>{frame.title}</span>
      {!!stickerName && <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.85 }}>{stickerName}</span>}
      <span style={{ marginTop: "auto", alignSelf: "flex-end", fontSize: 9, fontWeight: 700, opacity: 0.75 }}>{n}</span>
    </button>
  );
}
