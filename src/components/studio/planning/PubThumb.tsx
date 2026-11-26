import { Play, Video } from "lucide-react";
import { FORMAT_LABEL } from "@/lib/studio/constants";
import { slideTones, storyTones, titleCss, type Look } from "@/lib/studio/look";
import { FORMAT_BADGE } from "@/lib/studio/theme";
import type { StudioPublication } from "@/types/studio";

const RATIO: Record<string, string> = { reel: "9 / 16", story: "9 / 16", carrousel: "4 / 5" };

/** Vignette d'une publication dans le planning, à la charte de l'élève. */
export function PubThumb({ pub, look, on, onClick, appear }: { pub: StudioPublication; look: Look; on: boolean; onClick: () => void; appear?: boolean }) {
  const isReel = pub.format === "reel";
  const toCreate = pub.status === "a_creer" && !isReel;
  const slide = pub.content.slides?.[0];
  const frame = pub.content.frames?.[0];
  const tone = slide?.tone ?? frame?.tone ?? "dark";
  const t: [string, string, string] =
    pub.format === "story" ? [...storyTones(pub.style, tone, look), look.colors.accent] as [string, string, string] : slideTones(pub.style, tone, look);
  const kicker = slide?.kicker || (frame ? frame.sub : "") || pub.pillar;
  const title = slide?.title || frame?.title || pub.hook || pub.title;
  const badge = FORMAT_BADGE[pub.format];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={appear ? "studio-appear" : undefined}
      style={{
        flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: 6, borderRadius: 14, textAlign: "left",
        color: "var(--cacao)", background: "var(--ivoire)", border: on ? "2px solid var(--cacao)" : "1px solid var(--mocha-light)",
        boxShadow: "0 2px 10px rgba(90,62,54,0.08)", width: "100%",
      }}
    >
      {isReel || toCreate ? (
        <span style={{ flex: 1, minHeight: 120, borderRadius: 10, border: "1.5px dashed var(--mocha)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 8, textAlign: "center", fontSize: 11, color: "var(--noir)", background: "var(--ivoire)" }}>
          {isReel ? <Video size={22} strokeWidth={1.8} color="#8A604F" aria-hidden="true" /> : null}
          {isReel ? "Script prêt, en attente de tes vidéos" : (
            <>
              <span style={{ fontWeight: 700, color: "var(--cacao)" }}>{pub.title}</span>
              <span style={{ opacity: 0.6 }}>À créer</span>
            </>
          )}
        </span>
      ) : (
        <span style={{ width: "100%", aspectRatio: RATIO[pub.format], maxHeight: 150, boxSizing: "border-box", borderRadius: 10, padding: 8, display: "flex", flexDirection: "column", gap: 4, overflow: "hidden", background: t[0], color: t[1] }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: t[2] }}>{kicker}</span>
          <span style={{ ...titleCss(pub.style, look, 13) }}>{title}</span>
          {isReel && (
            <span aria-hidden="true" style={{ marginTop: "auto", alignSelf: "center", width: 30, height: 30, borderRadius: 999, background: "rgba(251,247,240,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={12} fill={look.colors.principale} color={look.colors.principale} />
            </span>
          )}
        </span>
      )}
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
        <span style={{ padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.fg }}>{FORMAT_LABEL[pub.format]}</span>
        <span style={{ fontSize: 11, fontWeight: 700 }}>{pub.scheduled_time}</span>
      </span>
      {pub.source === "declinaison" && (
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: "#8A604F" }}>Décliné du Reel</span>
      )}
    </button>
  );
}
