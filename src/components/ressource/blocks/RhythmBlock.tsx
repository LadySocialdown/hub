"use client";

import type { RhythmBlockDef } from "@/types/ressource";

export default function RhythmBlock({
  def,
  value,
  onChange,
}: {
  def: RhythmBlockDef;
  value: number;
  onChange: (v: number) => void;
}) {
  const range = Array.from(
    { length: def.max - def.min + 1 },
    (_, i) => def.min + i
  );

  return (
    <div>
      <p className="text-sm font-medium text-[var(--cacao)] mb-3">{def.label}</p>
      <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Rythme hebdomadaire">
        {range.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => onChange(n)}
            className={`w-12 h-12 rounded-full text-base font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cacao)] ${
              value === n
                ? "bg-[var(--cacao)] text-[var(--ivoire)]"
                : "bg-[var(--sable)] text-[var(--cacao)] hover:bg-[var(--mocha-light)]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {def.help && (
        <p className="mt-2 text-xs text-[var(--noir)] opacity-50 italic">{def.help}</p>
      )}
    </div>
  );
}
