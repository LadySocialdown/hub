import type { ComputedDef, ComputedValues, Answers, GridRow } from "@/types/ressource";

function getGridRows(answers: Answers, gridId: string): GridRow[] {
  const v = answers[gridId];
  if (!Array.isArray(v)) return [];
  return v as GridRow[];
}

function resolveNum(
  ref: string,
  answers: Answers,
  prev: ComputedValues
): number | null {
  if (ref in prev) return prev[ref];
  const v = answers[ref];
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }
  return null;
}

function evaluateOp(
  def: ComputedDef,
  answers: Answers,
  prev: ComputedValues
): number | null {
  switch (def.op) {
    case "countEq": {
      if (!def.grid || !def.col || def.value === undefined) return null;
      const rows = getGridRows(answers, def.grid);
      return rows.filter((r) => String(r[def.col!] ?? "") === def.value).length;
    }
    case "countDiff": {
      if (!def.grid || !def.colA || !def.colB) return null;
      const rows = getGridRows(answers, def.grid);
      return rows.filter((r) => {
        const valA = String(r[def.colA!] ?? "");
        const valB = String(r[def.colB!] ?? "");
        if (!valA && !valB) return false;
        if (def.ignore && valA === def.ignore) return false;
        return valA !== valB;
      }).length;
    }
    case "divCeil": {
      if (!def.a || !def.b) return null;
      const a = resolveNum(def.a, answers, prev);
      const b = resolveNum(def.b, answers, prev);
      if (a === null || b === null || b === 0) return null;
      return Math.ceil(a / b);
    }
    case "divPctCeil": {
      if (!def.a || !def.pct) return null;
      const a = resolveNum(def.a, answers, prev);
      const pct = resolveNum(def.pct, answers, prev);
      if (a === null || pct === null || pct === 0) return null;
      return Math.ceil(a / (pct / 100));
    }
    case "mulPctCeil": {
      if (!def.a || !def.pct) return null;
      const a = resolveNum(def.a, answers, prev);
      const pct = resolveNum(def.pct, answers, prev);
      if (a === null || pct === null) return null;
      return Math.ceil((a * pct) / 100);
    }
    case "perWeek": {
      if (!def.a) return null;
      const a = resolveNum(def.a, answers, prev);
      if (a === null) return null;
      return Math.max(1, Math.round(a / 4.33));
    }
    default:
      return null;
  }
}

export function evaluateComputed(
  defs: Record<string, ComputedDef>,
  answers: Answers
): ComputedValues {
  const result: ComputedValues = {};
  for (const [key, def] of Object.entries(defs)) {
    result[key] = evaluateOp(def, answers, result);
  }
  return result;
}

export function interpolateSentence(
  template: string,
  computed: ComputedValues,
  answers: Answers
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (key in computed) {
      const v = computed[key];
      return v !== null ? String(v) : "…";
    }
    const v = answers[key];
    return v !== null && v !== undefined && v !== "" ? String(v) : "…";
  });
}

import type { DiagnosticDef, FallbackDiagnostic } from "@/types/ressource";

export interface ActiveDiagnostic {
  id: string;
  title: string;
  text: string;
}

function evalCondition(
  cond: DiagnosticDef["when"],
  computed: ComputedValues
): boolean {
  const val = computed[cond.var] ?? null;
  if (val === null) return false;
  if (cond.gt !== undefined && !(val > cond.gt)) return false;
  if (cond.gte !== undefined && !(val >= cond.gte)) return false;
  if (cond.lte !== undefined && !(val <= cond.lte)) return false;
  if (cond.gteVar !== undefined) {
    const other = computed[cond.gteVar] ?? null;
    if (other === null) return false;
    const threshold = other + (cond.plus ?? 0);
    if (!(val >= threshold)) return false;
  }
  return true;
}

export function getActiveDiagnostics(
  diagnostics: DiagnosticDef[],
  fallback: FallbackDiagnostic | undefined,
  computed: ComputedValues
): ActiveDiagnostic[] {
  const active = diagnostics.filter((d) => evalCondition(d.when, computed));
  if (active.length > 0) return active;
  if (fallback) return [{ id: "fallback", title: fallback.title, text: fallback.text }];
  return [];
}
