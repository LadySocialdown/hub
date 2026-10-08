"use client";

import type { ReflectionBlockDef } from "@/types/ressource";

export default function ReflectionBlock({
  def,
  value,
  onChange,
}: {
  def: ReflectionBlockDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={`reflection-${def.id}`}
        className="block text-sm font-medium text-[var(--cacao)] mb-2"
      >
        {def.label}
      </label>
      <textarea
        id={`reflection-${def.id}`}
        rows={3}
        value={value}
        placeholder={def.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--mocha-light)] bg-white px-4 py-3 text-sm text-[var(--noir)] resize-none focus:outline-none focus:border-[var(--mocha)] focus:ring-1 focus:ring-[var(--mocha)]"
      />
    </div>
  );
}
