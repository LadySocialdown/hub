"use client";

import type { PriorityBlockDef } from "@/types/ressource";

const OBJ_ACCENT: Record<string, string> = {
  A: "border-[var(--cacao)] bg-[var(--cacao)] text-[var(--ivoire)]",
  C: "border-[var(--mocha)] bg-[var(--mocha)] text-[var(--ivoire)]",
  F: "border-[var(--mocha-light)] bg-[var(--sable)] text-[var(--cacao)]",
};

export default function PriorityBlock({
  def,
  value,
  suggestion,
  onChange,
}: {
  def: PriorityBlockDef;
  value: string;
  suggestion?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      {suggestion && (
        <p className="text-xs text-[var(--mocha)]">
          D'après ton audit, je te suggère{" "}
          <strong>
            {def.options.find((o) => o.value === suggestion)?.label ?? suggestion}
          </strong>.
          Tu peux choisir différemment si tu sais quelque chose que les chiffres ne voient pas.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Priorité">
        {def.options.map((opt) => {
          const selected = value === opt.value;
          const isSuggested = suggestion === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`relative rounded-2xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cacao)] ${
                selected
                  ? OBJ_ACCENT[opt.value] ?? "border-[var(--cacao)] bg-[var(--cacao)] text-[var(--ivoire)]"
                  : "border-[var(--mocha-light)] bg-white hover:border-[var(--mocha)] text-[var(--cacao)]"
              }`}
            >
              {isSuggested && !selected && (
                <span className="absolute top-2 right-2 text-[10px] font-semibold text-[var(--mocha)] bg-[var(--mocha-light)] rounded-full px-1.5 py-0.5">
                  suggéré
                </span>
              )}
              <p className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                {opt.label}
              </p>
              <p className="text-xs opacity-70 mb-1 italic">{opt.when}</p>
              <p className="text-xs opacity-80">{opt.text}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
