"use client";

import type { PlanBlockDef, PlanRow } from "@/types/ressource";

const OBJ_BADGE: Record<string, string> = {
  A: "bg-[var(--cacao)] text-[var(--ivoire)]",
  C: "bg-[var(--mocha)] text-[var(--ivoire)]",
  F: "bg-[var(--sable)] text-[var(--cacao)] border border-[var(--mocha-light)]",
};
const OBJ_LABELS: Record<string, string> = { A: "Attirer", C: "Convaincre", F: "Fidéliser" };

export default function PlanBlock({
  def,
  plan,
  onChangePlan,
  onGenerate,
  canGenerate,
}: {
  def: PlanBlockDef;
  plan: PlanRow[][];
  onChangePlan: (plan: PlanRow[][]) => void;
  onGenerate: () => void;
  canGenerate: boolean;
}) {
  function setRow(weekIdx: number, rowIdx: number, patch: Partial<PlanRow>) {
    const next = plan.map((week, wi) =>
      wi === weekIdx
        ? week.map((row, ri) => (ri === rowIdx ? { ...row, ...patch } : row))
        : week
    );
    onChangePlan(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--cacao)]">
          Ton planning sur 4 semaines
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="text-xs font-medium border border-[var(--mocha)] text-[var(--mocha)] rounded-full px-4 py-1.5 hover:bg-[var(--mocha)] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {plan.flat().length === 0 ? "Générer" : "Régénérer"}
        </button>
      </div>

      {!canGenerate && (
        <p className="text-xs text-[var(--noir)] opacity-50">
          Choisis une priorité et un rythme pour générer le planning.
        </p>
      )}

      {plan.map((week, wi) => (
        <div key={wi} className="rounded-2xl border border-[var(--mocha-light)] bg-white overflow-hidden shadow-warm">
          <div className="px-4 py-2.5 bg-[var(--sable)] text-xs font-semibold text-[var(--cacao)] uppercase tracking-wider">
            Semaine {wi + 1}
          </div>
          <div className="divide-y divide-[var(--mocha-light)]">
            {week.length === 0 ? (
              <p className="px-4 py-3 text-xs text-[var(--noir)] opacity-40 italic">
                Génère le planning pour remplir cette semaine.
              </p>
            ) : (
              week.map((row, ri) => (
                <div key={ri} className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 px-4 py-2.5 items-center">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      OBJ_BADGE[row.objectif] ?? "bg-[var(--sable)]"
                    }`}
                    title={OBJ_LABELS[row.objectif]}
                  >
                    {row.objectif}
                  </span>
                  <input
                    type="text"
                    value={row.sujet}
                    placeholder={def.example?.sujet ?? "Sujet du contenu"}
                    onChange={(e) => setRow(wi, ri, { sujet: e.target.value })}
                    className="rounded-lg border border-[var(--mocha-light)] bg-transparent px-3 py-1.5 text-sm text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)] focus:ring-1 focus:ring-[var(--mocha)]"
                    aria-label={`Sujet, semaine ${wi + 1}, publication ${ri + 1}`}
                  />
                  <input
                    type="text"
                    value={row.cta}
                    placeholder={def.example?.cta ?? "Appel à l'action"}
                    onChange={(e) => setRow(wi, ri, { cta: e.target.value })}
                    className="rounded-lg border border-[var(--mocha-light)] bg-transparent px-3 py-1.5 text-sm text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)] focus:ring-1 focus:ring-[var(--mocha)]"
                    aria-label={`CTA, semaine ${wi + 1}, publication ${ri + 1}`}
                  />
                  <label className="flex items-center gap-1.5 text-xs text-[var(--noir)] opacity-70 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.fait}
                      onChange={(e) => setRow(wi, ri, { fait: e.target.checked })}
                      className="w-4 h-4 accent-[var(--cacao)] rounded"
                      aria-label={`Publié, semaine ${wi + 1}, publication ${ri + 1}`}
                    />
                    Publié
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
