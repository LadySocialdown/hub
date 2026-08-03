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

### Configuration

1. Copier `.env.example` vers `.env.local` et renseigner `WINDSOR_API_KEY`,
   `ANTHROPIC_API_KEY` et `INSTAGRAM_ACCOUNT_ID`.
2. Appliquer la migration `supabase/migrations/002_instagram_analytics.sql` sur le
   projet Supabase.

### Scheduler

Le scheduler (`node-cron`, démarré dans `src/instrumentation.ts`) vérifie une fois par
jour (06:00 Europe/Paris) si une échéance est due et lance l'analyse automatiquement.
Il nécessite un process Node long-running (`npm run build && npm start`, éventuellement
sous `pm2 start npm --name lady-social-hub -- start` pour un lancement automatique au
démarrage de la machine) — `next dev` fonctionne aussi mais ne doit pas être utilisé en
production. Un bouton "Analyser maintenant" sur le dashboard permet de déclencher une
analyse hors calendrier à tout moment.

Le solde net d'abonnés est une **estimation** reconstruite à partir de
`follows_and_unfollows` et `follower_count_1d` — Instagram/Windsor.ai ne fournit pas les
désabonnements bruts.
