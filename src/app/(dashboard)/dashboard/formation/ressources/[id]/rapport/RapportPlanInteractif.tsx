"use client";

import { useState } from "react";
import type { PlanRow } from "@/types/ressource";

const OBJ_BADGE: Record<string, string> = {
  A: "bg-[var(--cacao)] text-[var(--ivoire)]",
  C: "bg-[var(--mocha)] text-[var(--ivoire)]",
  F: "bg-[var(--sable)] text-[var(--cacao)] border border-[var(--mocha-light)]",
};
const OBJ_LABELS: Record<string, string> = { A: "Attirer", C: "Convaincre", F: "Fidéliser" };

export default function RapportPlanInteractif({
  initialPlan,
  resourceId,
}: {
  initialPlan: PlanRow[][];
  resourceId: string;
}) {
  const [plan, setPlan] = useState<PlanRow[][]>(initialPlan);

  async function toggle(wi: number, ri: number) {
    const next = plan.map((week, w) =>
      w === wi
        ? week.map((row, r) => (r === ri ? { ...row, fait: !row.fait } : row))
        : week
    );
    setPlan(next);

    // Persist via answers update
    await fetch("/api/ressources/attempts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceId,
        resourceVersion: 1,
        answers: { plan: next },
        currentStep: "done",
      }),
    }).catch(() => null);
  }

  return (
    <div className="space-y-4">
      {plan.map((week, wi) => (
        <div key={wi} className="rounded-2xl border border-[var(--mocha-light)] bg-white overflow-hidden shadow-warm">
          <div className="px-4 py-2 bg-[var(--sable)] text-xs font-semibold text-[var(--cacao)] uppercase tracking-wider">
            Semaine {wi + 1}
          </div>
          <div className="divide-y divide-[var(--mocha-light)]">
            {week.map((row, ri) => (
              <div
                key={ri}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  row.fait ? "opacity-60 line-through" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                    OBJ_BADGE[row.objectif] ?? "bg-[var(--sable)]"
                  }`}
                  title={OBJ_LABELS[row.objectif]}
                >
                  {row.objectif}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--noir)] truncate">{row.sujet || "—"}</p>
                  {row.cta && (
                    <p className="text-xs text-[var(--mocha)] truncate">{row.cta}</p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs text-[var(--noir)] opacity-60 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={row.fait}
                    onChange={() => toggle(wi, ri)}
                    className="w-4 h-4 accent-[var(--cacao)] rounded"
                    aria-label={`Marquer comme publié, semaine ${wi + 1}, publication ${ri + 1}`}
                  />
                  Publié
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
