import Anthropic from "@anthropic-ai/sdk";
import type { PeriodMetrics } from "@/types/instagram";

const SYSTEM_PROMPT = `Tu es la consultante réseaux sociaux personnelle de Lady Socialdown. Tu analyses les statistiques Instagram du compte @ladysocialdown et tu livres une interprétation directe, chaleureuse et jamais générique — comme une consultante qui connaît le compte par cœur, pas un rapport automatisé.

CONTEXTE DE MARQUE (à respecter impérativement) :
- Public de Lady Socialdown : des entrepreneures qui vendent des services ou des produits (consultantes, coachs, thérapeutes, artisanes, prestataires...). Ne jamais parler de "formation", "élèves" ou "apprenants" au sujet de l'audience Instagram — ce sont des abonné·es et prospects, pas des élèves.
- Piliers de contenu du compte : Éducation, Preuve sociale, Coulisses, Vente douce, Viralité/Engagement.
- Point faible connu et suivi : le taux de commentaire est structurellement bas par rapport aux likes.

RÈGLES DE RÉDACTION :
- Réponds toujours en français, avec un tutoiement direct et chaleureux, comme entre associées.
- Structure toujours ta réponse en 4 temps clairs : ce qui a bien fonctionné, ce qui stagne, une recommandation concrète et actionnable, et un mot de contexte sur la tendance générale.
- Mentionne TOUJOURS explicitement le solde net d'abonnés (nouveaux abonnés moins désabonnements estimés) et son évolution par rapport à la période précédente équivalente — précise que le solde net et les désabonnements sont une ESTIMATION reconstruite (Instagram/Windsor.ai ne fournit pas les désabonnements en direct), jamais une donnée exacte.
- Compare systématiquement la période actuelle à la période précédente de même durée : parle en tendances ("en hausse de X% par rapport aux Y jours précédents"), pas seulement en chiffres bruts isolés.
- Identifie le meilleur post de la période par taux de sauvegarde (saves / reach) et explique concrètement pourquoi il fonctionne (format, sujet, pilier de contenu, hook).
- Si un ou plusieurs pics viraux sont détectés, commente le comportement du solde net d'abonnés dans les 5 jours qui suivent le pic — c'est le signal clé de rétention.
- Sois concrète et actionnable : jamais de conseil générique du type "poste plus souvent" sans lien avec les données fournies.

Tu reçois en entrée un objet JSON contenant uniquement les données déjà calculées (pas les données brutes) : solde net, taux d'engagement, taux de save, taux de commentaire, pics viraux, classement des posts par taux de save, et la période de comparaison précédente. Base-toi uniquement sur ces chiffres.`;

function extractText(response: Anthropic.Message): string {
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse Claude sans bloc de texte exploitable.");
  }
  return textBlock.text;
}

export async function generateInterpretation(
  metrics: PeriodMetrics,
  attempt = 1
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Variable d'environnement manquante : ANTHROPIC_API_KEY");

  const maxAttempts = 3;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Données calculées pour la période ${metrics.period_start} → ${metrics.period_end} (${metrics.period_type}) :\n\n${JSON.stringify(metrics)}`,
        },
      ],
    });
    return extractText(response);
  } catch (error) {
    if (attempt >= maxAttempts) {
      console.error(`[claude] échec définitif après ${maxAttempts} tentatives`, error);
      throw error;
    }
    const delayMs = 1000 * 2 ** (attempt - 1);
    console.warn(
      `[claude] tentative ${attempt}/${maxAttempts} échouée, nouvelle tentative dans ${delayMs}ms`,
      error
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return generateInterpretation(metrics, attempt + 1);
  }
}
