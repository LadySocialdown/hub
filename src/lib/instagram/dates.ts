// Utilitaires de date en UTC (format YYYY-MM-DD) pour éviter les décalages de fuseau
// horaire dans les calculs d'échéances et de périodes.

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseISO(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function addDaysISO(date: string, days: number): string {
  const d = parseISO(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetweenISO(from: string, to: string): number {
  const ms = parseISO(to).getTime() - parseISO(from).getTime();
  return Math.round(ms / 86_400_000);
}
