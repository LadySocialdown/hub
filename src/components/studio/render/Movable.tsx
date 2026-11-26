"use client";

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { ElementKey, ElementStyle, Elements } from "@/types/studio";

export type EditHandlers = {
  selected: ElementKey | null;
  onSelect: (k: ElementKey | null) => void;
  onMove: (k: ElementKey, pos: { x: number; y: number }) => void;
  /** Fige la position actuelle de tous les textes, pour qu'aucun ne bouge quand on en déplace un. */
  onFreeze: (positions: Partial<Record<ElementKey, { x: number; y: number }>>) => void;
};

const clamp = (v: number) => Math.min(95, Math.max(5, Math.round(v * 10) / 10));

export function elScale(els: Elements | undefined, k: ElementKey) {
  return els?.[k]?.scale ?? 1;
}

/**
 * Élément de texte du visuel. À sa place dans la mise en page tant qu'il n'a pas
 * été déplacé ; une fois glissé, il est posé librement (position en %).
 * En édition : un clic le sélectionne, un glisser le déplace.
 */
export function Movable({
  k, el, edit, box, flowStyle, children,
}: {
  k: ElementKey;
  el: ElementStyle | undefined;
  edit?: EditHandlers;
  box: RefObject<HTMLDivElement | null>;
  flowStyle?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; cx: number; cy: number; moved: boolean } | null>(null);
  const free = el?.x != null && el?.y != null;
  const sel = !!edit && edit.selected === k;

  const style: CSSProperties = free
    ? { position: "absolute", left: `${el!.x}%`, top: `${el!.y}%`, transform: "translate(-50%, -50%)", width: "86%", zIndex: 2 }
    : { position: "relative", ...flowStyle };
  if (el?.color) style.color = el.color;
  if (edit) {
    style.cursor = "move";
    style.touchAction = "none";
    style.userSelect = "none";
    style.WebkitUserSelect = "none";
    style.borderRadius = 6;
    style.outline = sel ? "2px dashed rgba(255,255,255,0.95)" : "1px dashed transparent";
    style.boxShadow = sel ? "0 0 0 3px rgba(26,20,16,0.45)" : undefined;
  }

  function down(e: React.PointerEvent) {
    if (!edit || !box.current || !ref.current) return;
    e.stopPropagation();
    e.preventDefault();
    edit.onSelect(k);
    const r = box.current.getBoundingClientRect();
    const me = ref.current.getBoundingClientRect();
    if (!free) {
      const positions: Partial<Record<ElementKey, { x: number; y: number }>> = {};
      box.current.querySelectorAll<HTMLElement>("[data-el]").forEach((node) => {
        const b = node.getBoundingClientRect();
        positions[node.dataset.el as ElementKey] = {
          x: clamp(((b.left + b.width / 2 - r.left) / r.width) * 100),
          y: clamp(((b.top + b.height / 2 - r.top) / r.height) * 100),
        };
      });
      edit.onFreeze(positions);
    }
    drag.current = {
      px: e.clientX, py: e.clientY,
      cx: ((me.left + me.width / 2 - r.left) / r.width) * 100,
      cy: ((me.top + me.height / 2 - r.top) / r.height) * 100,
      moved: false,
    };
    ref.current.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    const d = drag.current;
    if (!edit || !d || !box.current) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const r = box.current.getBoundingClientRect();
    edit.onMove(k, { x: clamp(d.cx + (dx / r.width) * 100), y: clamp(d.cy + (dy / r.height) * 100) });
  }
  function up() {
    drag.current = null;
  }

  return (
    <div ref={ref} data-el={k} style={style} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      role={edit ? "button" : undefined} aria-label={edit ? "Sélectionner et déplacer cet élément" : undefined} aria-pressed={edit ? sel : undefined}>
      {children}
    </div>
  );
}
