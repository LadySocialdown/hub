import type { PeriodType } from "@/types/instagram";
import { addDaysISO, daysBetweenISO } from "./dates";

// Échéances J+7, J+15, J+21, J+30 puis un nouveau cycle de 30 jours qui recommence
// (7, 15, 21, 30, 37, 45, 51, 60, 67, 75, 81, 90, ...).
const CYCLE_OFFSETS: Array<{ offset: number; label: PeriodType }> = [
  { offset: 7, label: "7j" },
  { offset: 15, label: "15j" },
  { offset: 21, label: "21j" },
  { offset: 30, label: "30j" },
];
const CYCLE_LENGTH = 30;

export interface Milestone {
  day: number; // nombre de jours écoulés depuis reference_date
  label: PeriodType;
  date: string; // date de l'échéance (reference_date + day jours)
}

/** Génère la séquence des échéances (jour, label) dans l'ordre, indéfiniment. */
function* milestoneSequence(): Generator<{ day: number; label: PeriodType }> {
  for (let cycle = 0; ; cycle += 1) {
    for (const { offset, label } of CYCLE_OFFSETS) {
      yield { day: cycle * CYCLE_LENGTH + offset, label };
    }
  }
}

/** Toutes les échéances dues (day <= joursEcoulés) mais pas encore analysées (day > lastMilestoneDay), triées par ordre croissant. */
export function computeDueMilestones(
  referenceDate: string,
  today: string,
  lastMilestoneDay: number
): Milestone[] {
  const daysSinceReference = daysBetweenISO(referenceDate, today);
  const due: Milestone[] = [];

  for (const { day, label } of milestoneSequence()) {
    if (day > daysSinceReference) break;
    if (day > lastMilestoneDay) {
      due.push({ day, label, date: addDaysISO(referenceDate, day) });
    }
  }

  return due;
}

/** Prochaine échéance après lastMilestoneDay (pour affichage "prochaine échéance prévue"). */
export function nextMilestone(referenceDate: string, lastMilestoneDay: number): Milestone {
  for (const { day, label } of milestoneSequence()) {
    if (day > lastMilestoneDay) {
      return { day, label, date: addDaysISO(referenceDate, day) };
    }
  }
  throw new Error("unreachable");
}

/** Date de début de période pour une échéance donnée (fin de la précédente, ou reference_date pour la première). */
export function periodStartFor(referenceDate: string, previousMilestoneDay: number): string {
  return previousMilestoneDay <= 0 ? referenceDate : addDaysISO(referenceDate, previousMilestoneDay);
}
