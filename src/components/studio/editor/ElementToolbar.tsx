"use client";

import { Minus, Plus, RotateCcw, X } from "lucide-react";
import type { Look } from "@/lib/studio/look";
import type { ElementKey, ElementStyle } from "@/types/studio";

const NAMES: Record<ElementKey, string> = {
  kicker: "Surtitre",
  title: "Titre",
  body: "Texte",
  cta: "Bouton",
  sub: "Petit texte",
  sticker: "Élément interactif",
};

/** Barre d'outils de l'élément sélectionné sur le visuel : couleur, taille, position. */
export function ElementToolbar({
  selected, el, look, onChange, onClose, mainTitle = "Titre",
}: {
  selected: ElementKey | null;
  el: ElementStyle | undefined;
  look: Look;
  onChange: (patch: Partial<ElementStyle>) => void;
  onClose: () => void;
  mainTitle?: string;
}) {
  if (!selected) {
    return (
      <p className="m-0 w-full max-w-[360px] rounded-xl border border-dashed border-[var(--mocha)]/50 px-3 py-2 text-center text-xs text-[var(--noir)] opacity-70">
        Clique sur un texte du visuel pour le déplacer, changer sa couleur ou sa taille.
      </p>
    );
  }
  const c = look.colors;
  const colors = Array.from(new Set([c.principale, c.accent, c.fond, c.detail, "#FFFFFF", "#1A1410"].map((x) => x.toUpperCase())));
  const cur = el?.color?.toUpperCase() ?? null;
  const scale = el?.scale ?? 1;
  const name = selected === "title" ? mainTitle : NAMES[selected];
  const round = "inline-flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)] disabled:opacity-40";
  const moved = el?.x != null;

  return (
    <div role="toolbar" aria-label={`Réglages : ${name}`} className="flex w-full max-w-[360px] flex-col gap-2 rounded-2xl border border-[var(--mocha-light)] bg-white p-2.5 shadow-warm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--mocha)]">{name}</span>
        <button type="button" onClick={onClose} aria-label="Fermer" className={round}><X size={15} aria-hidden="true" /></button>
      </div>
      {selected !== "sticker" && (
        <div role="group" aria-label="Couleur" className="flex flex-wrap items-center gap-1.5">
          <button type="button" aria-pressed={cur === null} onClick={() => onChange({ color: null })}
            className={`h-9 rounded-full px-2.5 text-xs font-bold text-[var(--cacao)] ${cur === null ? "border-2 border-[var(--cacao)] bg-[var(--sable)]" : "border border-[var(--mocha)]/40"}`}>
            Auto
          </button>
          {colors.map((o) => (
            <button key={o} type="button" aria-pressed={cur === o} aria-label={`Couleur ${o}`} onClick={() => onChange({ color: o })}
              className={`h-9 w-9 flex-none rounded-full border ${cur === o ? "border-[var(--cacao)] ring-2 ring-[var(--cacao)] ring-offset-1" : "border-[var(--mocha-light)]"}`} style={{ background: o }} />
          ))}
          <label className="relative h-9 w-9 flex-none cursor-pointer overflow-hidden rounded-full border border-dashed border-[var(--mocha)]"
            style={{ background: cur && !colors.includes(cur) ? cur : "conic-gradient(#e66, #ec6, #6c6, #6ce, #66e, #c6e, #e66)" }}>
            <span className="sr-only">Autre couleur</span>
            <input type="color" value={cur ?? "#000000"} onChange={(e) => onChange({ color: e.target.value.toUpperCase() })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          </label>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold">Taille</span>
        <button type="button" aria-label="Plus petit" disabled={scale <= 0.5} onClick={() => onChange({ scale: Math.max(0.5, Math.round((scale - 0.1) * 10) / 10) })} className={round}><Minus size={15} aria-hidden="true" /></button>
        <span className="min-w-10 text-center text-xs">{Math.round(scale * 100)} %</span>
        <button type="button" aria-label="Plus grand" disabled={scale >= 2.5} onClick={() => onChange({ scale: Math.min(2.5, Math.round((scale + 0.1) * 10) / 10) })} className={round}><Plus size={15} aria-hidden="true" /></button>
        <button type="button" disabled={!moved} onClick={() => onChange({ x: null, y: null })}
          className="ml-auto inline-flex h-9 items-center gap-1 rounded-full border border-[var(--mocha)]/40 px-2.5 text-xs text-[var(--cacao)] disabled:opacity-40">
          <RotateCcw size={13} aria-hidden="true" />
          Remettre en place
        </button>
      </div>
      <span className="text-[11px] text-[var(--noir)] opacity-60">Glisse le texte directement sur le visuel pour le déplacer.</span>
    </div>
  );
}
