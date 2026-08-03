"use client";

import type { DailySnapshotComputed } from "@/types/instagram";

const POSITIVE = "#5A3E36"; // cacao
const NEGATIVE = "#B0453C"; // rouge sourd, dans la même famille chaude
const BAR_AREA_HEIGHT = 140;

function formatDateShort(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

export function NetFollowerChart({ snapshots }: { snapshots: DailySnapshotComputed[] }) {
  if (snapshots.length === 0) {
    return (
      <p className="text-sm text-[var(--noir)] opacity-60">
        Pas encore de données quotidiennes pour cette période.
      </p>
    );
  }

  const maxAbs = Math.max(1, ...snapshots.map((d) => Math.abs(d.net_follower_change)));

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-2" role="img" aria-label="Évolution du solde net d'abonnés jour par jour">
        {snapshots.map((day) => {
          const isPositive = day.net_follower_change >= 0;
          const barHeight = Math.max(2, (Math.abs(day.net_follower_change) / maxAbs) * (BAR_AREA_HEIGHT / 2));

          return (
            <div key={day.date} className="group relative flex w-6 shrink-0 flex-col items-center">
              <div
                className="flex w-full flex-col justify-end"
                style={{ height: BAR_AREA_HEIGHT / 2 }}
              >
                {isPositive && (
                  <div
                    className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                    style={{ height: barHeight, backgroundColor: POSITIVE }}
                  />
                )}
              </div>
              <div className="h-px w-full bg-[var(--mocha-light)]" />
              <div className="flex w-full flex-col" style={{ height: BAR_AREA_HEIGHT / 2 }}>
                {!isPositive && (
                  <div
                    className="w-full rounded-b-sm transition-opacity group-hover:opacity-80"
                    style={{ height: barHeight, backgroundColor: NEGATIVE }}
                  />
                )}
              </div>

              <span className="mt-1 text-[10px] text-[var(--noir)] opacity-50">{formatDateShort(day.date)}</span>

              <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-[var(--cacao)] px-2 py-1 text-xs text-[var(--ivoire)] shadow-md group-hover:block">
                {formatDateShort(day.date)} : {day.net_follower_change >= 0 ? "+" : ""}
                {day.net_follower_change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--noir)] opacity-70">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: POSITIVE }} />
          Gain net
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: NEGATIVE }} />
          Perte nette
        </span>
        <span className="italic">Solde net = estimation (Instagram ne fournit pas les désabonnements en direct)</span>
      </div>
    </div>
  );
}
