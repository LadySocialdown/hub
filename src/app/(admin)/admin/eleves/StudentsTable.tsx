"use client";

import { useState, useTransition } from "react";
import type { StudentRow } from "@/lib/students/list";
import { CPF_STATUT_OPTIONS } from "@/lib/students/list";
import { updateCpfStatutAction } from "./actions";

const MODE_LABELS: Record<StudentRow["mode"], string> = {
  cpf: "CPF",
  direct: "Fonds propres",
  invitation: "Invitation envoyée",
};

const MODE_BADGE_CLASSES: Record<StudentRow["mode"], string> = {
  cpf: "bg-[var(--mocha-light)] text-[var(--cacao)]",
  direct: "bg-green-100 text-green-800",
  invitation: "bg-amber-100 text-amber-800",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function CpfStatutSelect({ studentId, statut }: { studentId: string; statut: string }) {
  const [value, setValue] = useState(statut);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(newValue: string) {
    const previous = value;
    setValue(newValue);
    setError(null);
    startTransition(async () => {
      const result = await updateCpfStatutAction(studentId, newValue);
      if (!result.ok) {
        setValue(previous);
        setError(result.message);
      }
    });
  }

  return (
    <div>
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-full border border-[var(--mocha-light)] px-3 py-1.5 text-xs focus:border-[var(--cacao)] focus:outline-none disabled:opacity-60"
      >
        {CPF_STATUT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function StudentsTable({ students }: { students: StudentRow[] }) {
  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-8 text-center text-sm text-[var(--noir)] opacity-50">
        Aucune élève pour l&apos;instant.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--mocha-light)] bg-white shadow-warm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--mocha-light)] text-xs uppercase tracking-wide text-[var(--mocha)]">
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Formation</th>
            <th className="px-4 py-3 font-medium">Mode</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--mocha-light)]">
          {students.map((s) => (
            <tr key={s.key}>
              <td className="px-4 py-3 text-[var(--noir)]">{s.nom}</td>
              <td className="px-4 py-3 text-[var(--noir)] opacity-80">{s.email}</td>
              <td className="px-4 py-3 text-[var(--noir)]">{s.formation}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${MODE_BADGE_CLASSES[s.mode]}`}
                >
                  {MODE_LABELS[s.mode]}
                </span>
              </td>
              <td className="px-4 py-3">
                {s.mode === "cpf" && s.cpfStudentId ? (
                  <CpfStatutSelect studentId={s.cpfStudentId} statut={s.cpfStatutDossier ?? "en_attente"} />
                ) : (
                  <span className="text-[var(--noir)] opacity-70">{s.statut}</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-[var(--noir)] opacity-60">{formatDate(s.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
