"use client";

import { useState } from "react";
import type { FieldDef, Answers, ComputedValues } from "@/types/ressource";
import { interpolateSentence } from "@/lib/ressource/compute";

function HelpIcon({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Aide"
        className="ml-1 w-4 h-4 rounded-full text-[10px] font-bold bg-[var(--mocha-light)] text-[var(--cacao)] hover:bg-[var(--mocha)] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cacao)]"
      >
        ?
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-10 w-64 rounded-xl bg-[var(--cacao)] text-[var(--ivoire)] text-xs p-3 shadow-warm-lg">
          {text}
        </div>
      )}
    </div>
  );
}

export default function FieldsBlock({
  fields,
  answers,
  computed,
  objectiveSentence,
  note,
  onChange,
}: {
  fields: FieldDef[];
  answers: Answers;
  computed: ComputedValues;
  objectiveSentence?: string;
  note?: string;
  onChange: (id: string, value: string | number) => void;
}) {
  const COMPUTED_LABELS: Record<string, string> = {
    clientes: "clientes par mois",
    demandes: "demandes au total",
    demandesReseaux: "demandes depuis les réseaux",
    parSemaine: "demandes par semaine",
  };

  const computedKeys = Object.keys(computed);
  const hasComputed = computedKeys.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id}>
            <label
              htmlFor={`field-${f.id}`}
              className="block text-sm font-medium text-[var(--cacao)] mb-1.5"
            >
              {f.label}
              {f.help && <HelpIcon text={f.help} />}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`field-${f.id}`}
                type={f.type === "number" ? "number" : "text"}
                min={f.type === "number" ? 0 : undefined}
                value={answers[f.id] !== undefined && answers[f.id] !== null ? String(answers[f.id]) : ""}
                placeholder={
                  f.placeholder ??
                  (f.example !== undefined ? `ex. ${f.example}` : undefined)
                }
                onChange={(e) =>
                  onChange(
                    f.id,
                    f.type === "number"
                      ? e.target.value === ""
                        ? ""
                        : parseFloat(e.target.value)
                      : e.target.value
                  )
                }
                className="flex-1 rounded-xl border border-[var(--mocha-light)] bg-white px-4 py-2.5 text-sm text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)] focus:ring-1 focus:ring-[var(--mocha)]"
              />
              {f.unit && (
                <span className="text-sm text-[var(--noir)] opacity-50 shrink-0">{f.unit}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasComputed && (
        <div className="rounded-2xl bg-[var(--sable)] border border-[var(--mocha-light)] p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--mocha)] mb-4">
            Résultats
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {computedKeys.map((key) => {
              const val = computed[key];
              return (
                <div key={key} className="text-center">
                  <p
                    className="text-3xl font-bold text-[var(--cacao)] leading-none"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {val !== null ? val : <span className="opacity-30">…</span>}
                  </p>
                  <p className="text-xs text-[var(--noir)] opacity-60 mt-1">
                    {COMPUTED_LABELS[key] ?? key}
                  </p>
                </div>
              );
            })}
          </div>

          {objectiveSentence && (
            <p className="mt-5 text-sm font-medium text-[var(--cacao)] border-t border-[var(--mocha-light)] pt-4 italic">
              {interpolateSentence(objectiveSentence, computed, answers)}
            </p>
          )}
        </div>
      )}

      {note && (
        <p className="text-xs text-[var(--noir)] opacity-50 italic">{note}</p>
      )}
    </div>
  );
}
