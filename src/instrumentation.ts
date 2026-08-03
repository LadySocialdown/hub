// Démarre le scheduler d'analyse Instagram (section 3 du brief) au lancement du
// serveur Next.js. node-cron vérifie une fois par jour si une échéance J+7/15/21/30
// est due ; le calcul précis des échéances vit dans lib/instagram/milestones.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as unknown as { __instagramCronStarted?: boolean };
  if (g.__instagramCronStarted) return;
  g.__instagramCronStarted = true;

  const cron = await import("node-cron");
  const { runDueAnalyses } = await import("@/lib/instagram/scheduler");

  cron.schedule(
    "0 6 * * *",
    async () => {
      try {
        const reports = await runDueAnalyses();
        if (reports.length > 0) {
          console.log(`[instagram] ${reports.length} rapport(s) généré(s) automatiquement`);
        }
      } catch (error) {
        console.error("[instagram] échec du cycle planifié, nouvelle tentative demain", error);
      }
    },
    { timezone: "Europe/Paris" }
  );

  console.log("[instagram] scheduler démarré (vérification quotidienne à 06:00 Europe/Paris)");
}
