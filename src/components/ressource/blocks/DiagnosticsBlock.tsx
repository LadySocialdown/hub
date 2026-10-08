"use client";

import type { ActiveDiagnostic } from "@/lib/ressource/compute";

export default function DiagnosticsBlock({
  diagnostics,
  warning,
}: {
  diagnostics: ActiveDiagnostic[];
  warning?: string;
}) {
  if (diagnostics.length === 0 && !warning) return null;

  return (
    <div className="space-y-3">
      {diagnostics.map((d) => (
        <div
          key={d.id}
          className="rounded-2xl border border-[var(--mocha-light)] bg-white p-5 shadow-warm"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs uppercase tracking-wider text-[var(--mocha)] mb-1">
            Diagnostic
          </p>
          <p
            className="text-base font-semibold text-[var(--cacao)] mb-1"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {d.title}
          </p>
          <p className="text-sm text-[var(--noir)] opacity-80">{d.text}</p>
        </div>
      ))}

      {warning && (
        <div className="rounded-xl bg-[var(--sable)] border-l-2 border-[var(--mocha)] px-4 py-3">
          <p className="text-xs text-[var(--noir)] opacity-70">{warning}</p>
        </div>
      )}
    </div>
  );
}
