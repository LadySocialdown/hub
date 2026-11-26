"use client";

import type { Look } from "@/lib/studio/look";

/** Choix d'une couleur : automatique (style), couleurs de la charte, blanc, noir ou couleur libre. */
export function ColorRow({ id, label, value, onChange, look }: { id: string; label: string; value: string | null | undefined; onChange: (v: string | null) => void; look: Look }) {
  const c = look.colors;
  const options = Array.from(new Set([c.principale, c.accent, c.fond, c.detail, "#FFFFFF", "#1A1410"].map((x) => x.toUpperCase())));
  const cur = value?.toUpperCase() ?? null;
  const swatch = "h-11 w-11 flex-none rounded-full border";
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-[13px] font-bold text-[var(--noir)]">{label}</span>
      <div role="group" aria-labelledby={id} className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={cur === null} onClick={() => onChange(null)}
          className={`min-h-11 rounded-full px-3 text-xs font-bold text-[var(--cacao)] ${cur === null ? "border-2 border-[var(--cacao)] bg-[var(--sable)]" : "border border-[var(--mocha)]/40"}`}>
          Auto
        </button>
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={cur === o} aria-label={`${label} : ${o}`} onClick={() => onChange(o)}
            className={`${swatch} ${cur === o ? "border-[var(--cacao)] ring-2 ring-[var(--cacao)] ring-offset-2" : "border-[var(--mocha-light)]"}`} style={{ background: o }} />
        ))}
        <label className={`${swatch} relative cursor-pointer overflow-hidden border-dashed border-[var(--mocha)]`} title="Autre couleur"
          style={{ background: cur && !options.includes(cur) ? cur : "conic-gradient(#e66, #ec6, #6c6, #6ce, #66e, #c6e, #e66)" }}>
          <span className="sr-only">{label} : autre couleur</span>
          <input type="color" value={cur ?? "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </label>
      </div>
    </div>
  );
}
