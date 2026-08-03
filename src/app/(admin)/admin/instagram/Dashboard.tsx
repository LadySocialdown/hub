"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InstagramReport, PeriodType } from "@/types/instagram";
import { NetFollowerChart } from "./NetFollowerChart";
import { triggerManualAnalysisAction } from "./actions";

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)} %`;
}

function KpiCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--mocha)]">{label}</p>
      <p
        className="mt-2 text-2xl font-semibold text-[var(--cacao)]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-[var(--noir)] opacity-60">{sublabel}</p>}
    </div>
  );
}

const PERIOD_LABELS: Record<PeriodType, string> = {
  "7j": "7 jours",
  "15j": "15 jours",
  "21j": "21 jours",
  "30j": "30 jours",
  manuel: "Analyse manuelle",
};

export function Dashboard({
  initialReport,
  reportHistory,
  nextDueDate,
  nextDueLabel,
}: {
  initialReport: InstagramReport | null;
  reportHistory: InstagramReport[];
  nextDueDate: string;
  nextDueLabel: PeriodType;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialReport?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selected = reportHistory.find((r) => r.id === selectedId) ?? initialReport;
  const metrics = selected?.raw_metrics_json ?? null;

  function handleAnalyzeNow() {
    setError(null);
    startTransition(async () => {
      const result = await triggerManualAnalysisAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
            Instagram — @ladysocialdown
          </p>
          <h1
            className="text-3xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Analyse automatisée
          </h1>
          <p className="mt-2 text-sm text-[var(--noir)] opacity-70">
            {initialReport
              ? `Dernière analyse le ${formatDate(initialReport.generated_at.slice(0, 10))} — période ${PERIOD_LABELS[initialReport.period_type]} (${formatDate(initialReport.period_start)} → ${formatDate(initialReport.period_end)})`
              : "Aucune analyse générée pour l'instant."}
            <br />
            Prochaine échéance prévue : {formatDate(nextDueDate)} ({PERIOD_LABELS[nextDueLabel]})
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            onClick={handleAnalyzeNow}
            disabled={isPending}
            className="rounded-full bg-[var(--cacao)] px-5 py-2.5 text-sm font-medium text-[var(--ivoire)] transition-colors hover:bg-[var(--mocha)] disabled:opacity-60"
          >
            {isPending ? "Analyse en cours…" : "Analyser maintenant"}
          </button>
          {error && <p className="text-xs text-red-700">{error}</p>}
        </div>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <KpiCard label="Abonnés actuels" value={metrics.profile.followers_count.toLocaleString("fr-FR")} />
            <KpiCard
              label="Solde net (période)"
              value={`${metrics.net_follower.net_balance >= 0 ? "+" : ""}${metrics.net_follower.net_balance}`}
              sublabel="Estimation"
            />
            <KpiCard label="Taux d'engagement" value={formatPercent(metrics.engagement_rate)} />
            <KpiCard label="Taux de save moyen" value={formatPercent(metrics.average_save_rate)} />
            <KpiCard label="Taux de commentaire" value={formatPercent(metrics.comment_rate)} />
          </div>

          <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-6">
            <h2
              className="mb-4 text-lg font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Solde net d&apos;abonnés — jour par jour
            </h2>
            <NetFollowerChart snapshots={metrics.daily_snapshots} />
          </div>

          <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-6">
            <h2
              className="mb-4 text-lg font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Interprétation
            </h2>
            {selected?.interpretation_text ? (
              <div className="space-y-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--noir)]">
                {selected.interpretation_text}
              </div>
            ) : (
              <p className="text-sm italic text-[var(--noir)] opacity-60">
                Interprétation indisponible pour ce rapport (API Anthropic injoignable au moment de la génération).
                Les métriques ci-dessus restent fiables.
              </p>
            )}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-6">
        <h2
          className="mb-4 text-lg font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Historique des rapports
        </h2>
        {reportHistory.length === 0 ? (
          <p className="text-sm text-[var(--noir)] opacity-60">Aucun rapport pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-[var(--mocha-light)]">
            {reportHistory.map((report) => (
              <li key={report.id}>
                <button
                  onClick={() => setSelectedId(report.id)}
                  className={`flex w-full items-center justify-between py-3 text-left text-sm transition-colors hover:text-[var(--cacao)] ${
                    report.id === selected?.id ? "text-[var(--cacao)] font-medium" : "text-[var(--noir)]"
                  }`}
                >
                  <span>
                    {PERIOD_LABELS[report.period_type]} — {formatDate(report.period_start)} → {formatDate(report.period_end)}
                  </span>
                  <span className="text-xs opacity-60">{formatDate(report.generated_at.slice(0, 10))}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
