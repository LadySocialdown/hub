import type { PlanRow } from "@/types/ressource";

const OBJECTIVES = ["A", "C", "F"] as const;
type Obj = (typeof OBJECTIVES)[number];

export function generatePlanning(
  priority: string,
  rhythm: number,
  existing: PlanRow[][]
): PlanRow[][] {
  const primary = priority as Obj;
  const others = OBJECTIVES.filter((o) => o !== primary);
  const weeks = 4;
  const primaryCount = Math.ceil(rhythm / 2);

  return Array.from({ length: weeks }, (_, w) => {
    const existingWeek: PlanRow[] = existing[w] ?? [];
    return Array.from({ length: rhythm }, (_, i) => {
      const existingRow = existingWeek[i];
      let objectif: string;
      if (i < primaryCount) {
        objectif = primary;
      } else {
        const slot = i - primaryCount;
        objectif = others[(slot + w) % others.length];
      }
      return {
        objectif,
        sujet: existingRow?.sujet ?? "",
        cta: existingRow?.cta ?? "",
        fait: existingRow?.fait ?? false,
      };
    });
  });
}

export function suggestPriority(
  nbA: number | null,
  nbC: number | null,
  nbF: number | null,
  filledRows: number
): Obj {
  if (filledRows < 3) return "C";
  const a = nbA ?? 0;
  const c = nbC ?? 0;
  const f = nbF ?? 0;
  if (a >= c + 2) return "C";
  if (c >= a + 2) return "A";
  if (f === 0) return "F";
  return "C";
}
