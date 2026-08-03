This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Analyse Instagram automatisée (@ladysocialdown)

Section admin (`/admin/instagram`) qui analyse automatiquement les statistiques Instagram
du compte à J+7, J+15, J+21, J+30 (cycle qui se répète ensuite en continu), via
Windsor.ai (données) et l'API Anthropic (interprétation en français). Voir
`supabase/migrations/002_instagram_analytics.sql` pour le schéma et
`src/lib/instagram/` pour la logique métier.

L'app est hébergée sur **Vercel** (serverless) : le scheduler ne peut donc pas être un
process long-running, il tourne via **Vercel Cron** qui appelle une route API à intervalle
fixe.

### Configuration

1. Copier `.env.example` vers `.env.local` et renseigner `WINDSOR_API_KEY`,
   `ANTHROPIC_API_KEY` et `INSTAGRAM_ACCOUNT_ID`.
2. Appliquer la migration `supabase/migrations/002_instagram_analytics.sql` sur le
   projet Supabase.
3. Générer un `CRON_SECRET` (ex. `openssl rand -hex 32`) et le renseigner à la fois en
   variable d'environnement locale/Vercel et — c'est la même valeur des deux côtés,
   Vercel Cron l'envoie automatiquement en en-tête `Authorization: Bearer <CRON_SECRET>`
   sur les requêtes qu'il déclenche.
4. Sur Vercel, les Cron Jobs se déploient automatiquement à partir de `vercel.json` (pas
   de configuration manuelle dans le dashboard nécessaire), à condition que le repo soit
   bien connecté comme projet Vercel.

### Scheduler

`vercel.json` déclare un Cron Job qui appelle `GET /api/instagram/cron` une fois par jour
à 05:00 UTC (~06-07h Europe/Paris selon l'heure d'été — Vercel Cron ne supporte pas de
fuseau horaire, seulement l'UTC). La route vérifie l'échéance J+7/15/21/30 due et lance
l'analyse si besoin (`src/lib/instagram/scheduler.ts` → `runDueAnalyses()`). Le plan
Hobby de Vercel limite les cron jobs à 1 exécution/jour maximum, ce qui suffit largement
ici ; un plan Pro permettrait une fréquence plus élevée si besoin un jour.

Le bouton "Analyser maintenant" sur le dashboard déclenche une Server Action
(`src/app/(admin)/admin/instagram/actions.ts`) indépendante du cron, à tout moment.

Windsor.ai + Claude peuvent prendre plus que les 10s d'exécution par défaut de Vercel :
la route de cron et la Server Action déclarent toutes les deux `maxDuration = 60`
(secondes) — à ajuster selon le plan Vercel (60s max en Hobby, davantage en Pro/Enterprise).

Le solde net d'abonnés est une **estimation** reconstruite à partir de
`follows_and_unfollows` et `follower_count_1d` — Instagram/Windsor.ai ne fournit pas les
désabonnements bruts.
