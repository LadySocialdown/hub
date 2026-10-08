"use client";

import type { GridBlockDef, GridRow } from "@/types/ressource";

const OBJ_LABELS: Record<string, string> = { A: "Attirer", C: "Convaincre", F: "Fidéliser" };
const OBJ_COLORS: Record<string, string> = {
  A: "bg-[var(--cacao)] text-[var(--ivoire)]",
  C: "bg-[var(--mocha)] text-[var(--ivoire)]",
  F: "bg-[var(--sable)] text-[var(--cacao)] border border-[var(--mocha-light)]",
};

function ObjectiveCell({
  value,
  allowNone,
  onChange,
}: {
  value: string;
  allowNone?: boolean;
  onChange: (v: string) => void;
}) {
  const opts = allowNone
    ? [
        { v: "A", label: "A" },
        { v: "C", label: "C" },
        { v: "F", label: "F" },
        { v: "0", label: "—" },
      ]
    : [
        { v: "A", label: "A" },
        { v: "C", label: "C" },
        { v: "F", label: "F" },
      ];
  return (
    <div className="flex gap-1 flex-wrap" role="group">
      {opts.map(({ v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? "" : v)}
          aria-pressed={value === v}
          className={`w-7 h-7 rounded-full text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cacao)] ${
            value === v
              ? (OBJ_COLORS[v] ?? "bg-[var(--cacao)] text-white")
              : "bg-[var(--sable)] text-[var(--cacao)] hover:bg-[var(--mocha-light)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function GridBlock({
  def,
  rows,
  onChange,
}: {
  def: GridBlockDef;
  rows: GridRow[];
  onChange: (rows: GridRow[]) => void;
}) {
  const filledCount = rows.filter((r) =>
    def.columns.some((c) => r[c.id] !== undefined && r[c.id] !== "" && r[c.id] !== null)
  ).length;

  function setCell(rowIdx: number, colId: string, value: string | number) {
    const next = Array.from({ length: def.rows }, (_, i) => rows[i] ?? {}) as GridRow[];
    next[rowIdx] = { ...next[rowIdx], [colId]: value };
    onChange(next);
  }

  const displayRows = Array.from({ length: def.rows }, (_, i) => rows[i] ?? {}) as GridRow[];

  return (
    <div className="space-y-3">
      {def.help && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(def.help).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[var(--sable)] px-3 py-2">
              <span
                className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold text-xs mr-1 ${OBJ_COLORS[k] ?? ""}`}
              >
                {k}
              </span>
              <span className="text-[var(--noir)] opacity-70">{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--mocha-light)] bg-white shadow-warm">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--sable)]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--cacao)] opacity-60 w-8">#</th>
              {def.columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-3 py-2 text-left text-xs font-medium text-[var(--cacao)] whitespace-nowrap ${col.wide ? "min-w-[180px]" : "min-w-[80px]"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--mocha-light)]">
            {def.example && (
              <tr className="opacity-40 italic bg-[var(--sable)]/50">
                <td className="px-3 py-2 text-xs text-[var(--noir)]">ex.</td>
                {def.columns.map((col) => (
                  <td key={col.id} className="px-3 py-2 text-xs text-[var(--noir)]">
                    {col.type === "objective" ? (
                      <span
                        className={`inline-block w-7 h-7 rounded-full text-center leading-7 font-bold text-xs ${
                          OBJ_COLORS[String(def.example![col.id])] ?? ""
                        }`}
                      >
                        {String(def.example![col.id] ?? "—")}
                      </span>
                    ) : (
                      String(def.example![col.id] ?? "")
                    )}
                  </td>
                ))}
              </tr>
            )}
            {displayRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[var(--sable)]/30 transition-colors">
                <td className="px-3 py-2 text-xs text-[var(--noir)] opacity-40">{rowIdx + 1}</td>
                {def.columns.map((col) => (
                  <td key={col.id} className="px-3 py-1.5">
                    {col.type === "objective" ? (
                      <ObjectiveCell
                        value={String(row[col.id] ?? "")}
                        allowNone={col.allowNone}
                        onChange={(v) => setCell(rowIdx, col.id, v)}
                      />
                    ) : col.type === "number" ? (
                      <input
                        type="number"
                        min={0}
                        value={row[col.id] !== undefined && row[col.id] !== "" ? String(row[col.id]) : ""}
                        onChange={(e) =>
                          setCell(rowIdx, col.id, e.target.value === "" ? "" : parseFloat(e.target.value))
                        }
                        className="w-20 rounded-lg border border-[var(--mocha-light)] bg-transparent px-2 py-1 text-sm text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)] focus:ring-1 focus:ring-[var(--mocha)]"
                        aria-label={`${col.label}, ligne ${rowIdx + 1}`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(row[col.id] ?? "")}
                        onChange={(e) => setCell(rowIdx, col.id, e.target.value)}
                        className="w-full min-w-[160px] rounded-lg border border-[var(--mocha-light)] bg-transparent px-2 py-1 text-sm text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)] focus:ring-1 focus:ring-[var(--mocha)]"
                        aria-label={`${col.label}, ligne ${rowIdx + 1}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {def.minFilled !== undefined && (
        <p className="text-xs text-[var(--noir)] opacity-50">
          {filledCount} / {def.rows} lignes remplies
          {filledCount < def.minFilled && ` — au moins ${def.minFilled} recommandées`}
        </p>
      )}
    </div>
  );
}
