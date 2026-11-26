/**
 * Démonstration du studio : recrée la semaine du 7 décembre de la maquette
 * (StudioV2) pour un utilisateur donné, avec les réglages de « atelier.fleuri ».
 *
 * Usage (Node 22.18 ou plus récent, variables lues dans .env.local) :
 *   node scripts/seed-studio.ts <clerk_user_id>
 *
 * Le script remplace les réglages de l'utilisateur et supprime ses publications
 * du 7 au 13 décembre 2026 avant de les recréer. Il ne touche pas aux crédits.
 */
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Variables déjà présentes dans l'environnement.
}

const userId = process.argv[2];
if (!userId) {
  console.error("Usage : node scripts/seed-studio.ts <clerk_user_id>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont nécessaires.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const settings = {
  user_id: userId,
  activity: "Bouquets et compositions florales sur mesure, à Tours",
  audience: "Particuliers qui veulent offrir, et futurs mariés",
  handle: "atelier.fleuri",
  tone: "Poétique, chaleureux, précis",
  show_logo_on_cover: true,
  colors: { principale: "#2F4A3A", accent: "#E9B8B0", fond: "#FBF7F0", detail: "#8E4E45" },
  font_title: "Cormorant Garamond",
  font_body: "DM Sans",
  default_style: "doux",
  pillars: [
    { name: "Expertise", description: "Conseils et savoir-faire", color: "#5A3E36" },
    { name: "Coulisses", description: "Atelier, création, quotidien", color: "#A47864" },
    { name: "Preuves", description: "Avis, réalisations, avant/après", color: "#C9A99A" },
    { name: "Offre", description: "Produits, prestations, appels à l'action", color: "#E3D3C8" },
  ],
  networks: ["Instagram", "TikTok"],
  posts_per_week: 5,
  preferred_time: "18:00",
  updated_at: new Date().toISOString(),
};

const KPIS: Record<string, string> = {
  "Faire découvrir": "Portée et partages",
  "Apporter de la valeur": "Enregistrements",
  "Créer du lien": "Commentaires et réponses",
  Rassurer: "Visites du profil et questions",
  "Faire passer à l'action": "Messages et clics sur le lien",
};

const frame = (title: string, sub: string, tone: string, extra: Record<string, string> = {}) => ({
  title, sub, sticker: "none", sticker_text: "", opt_a: "", opt_b: "", bg: "color", photo_url: null, photo_label: "", tone, ...extra,
});

type Seed = {
  date: string; time: string; format: "carrousel" | "story" | "reel"; title: string; hook: string;
  pillar: string; objective: string; status: string; source: string; content: Record<string, unknown>;
  cta?: string; caption?: string; hashtags?: string;
};

const items: Seed[] = [
  {
    date: "2026-12-07", time: "9:00", format: "story", title: "Dernier jour pour une livraison le 24",
    hook: "Livraison le 24 : derniers créneaux", pillar: "Offre", objective: "Rassurer", status: "cree", source: "cahier",
    content: { frames: [frame("Livraison le 24 : derniers créneaux", "Commande avant ce soir minuit", "pink", { sticker: "countdown", sticker_text: "Fin des commandes" })] },
  },
  {
    date: "2026-12-08", time: "18:00", format: "carrousel", title: "Les coulisses d'une commande de mariage",
    hook: "De l'idée au bouquet de mariée", pillar: "Coulisses", objective: "Faire découvrir", status: "cree", source: "cahier",
    cta: "Raconte-moi ton mariage en message",
    caption: "Un bouquet de mariée, c'est d'abord une conversation. Je t'emmène dans les coulisses de la dernière commande de l'atelier.",
    hashtags: "#fleuristetours #bouquetdemariee #mariage2027",
    content: {
      slides: [
        { layout: "cover", kicker: "Coulisses", title: "De l'idée au bouquet de mariée", body: "Une commande, cinq étapes.", tone: "light", photo_url: null, photo_label: "Bouquet de mariée sur l'établi", generated: false },
        { layout: "photo", kicker: "Étape 1", title: "On se rencontre", body: "Un café, ton inspiration, tes couleurs.", tone: "light", photo_url: null, photo_label: "Planche d'inspiration", generated: false },
        { layout: "photo", kicker: "Étape 2", title: "Je choisis les fleurs", body: "Au marché, selon la saison et ta robe.", tone: "light", photo_url: null, photo_label: "Fleurs au marché", generated: false },
        { layout: "text", kicker: "Étape 3", title: "Le bouquet test", body: "Un premier essai, pour ajuster la forme et les teintes.", tone: "pink", photo_url: null, photo_label: "", generated: false },
        { layout: "cta", kicker: "Ton tour", title: "Raconte-moi ton mariage", body: "Écris-moi en message, je te réponds sous 48 h.", tone: "dark", photo_url: null, photo_label: "", generated: false },
      ],
    },
  },
  {
    date: "2026-12-09", time: "12:00", format: "reel", title: "Choisir un bouquet selon la personne",
    hook: "Quel bouquet pour qui ?", pillar: "Expertise", objective: "Apporter de la valeur", status: "a_creer", source: "cahier", content: {},
  },
  {
    date: "2026-12-10", time: "9:00", format: "story", title: "Mon atelier se prépare pour Noël",
    hook: "L'atelier version décembre", pillar: "Coulisses", objective: "Créer du lien", status: "a_creer", source: "cahier", content: {},
  },
  {
    date: "2026-12-11", time: "9:00", format: "story", title: "Les coulisses du tournage",
    hook: "Dans les coulisses du Reel", pillar: "Coulisses", objective: "Créer du lien", status: "a_creer", source: "declinaison", content: {},
  },
  {
    date: "2026-12-11", time: "18:00", format: "carrousel", title: "Une table de fête avec seulement 3 tiges",
    hook: "Une table de fête avec 3 tiges", pillar: "Expertise", objective: "Faire découvrir", status: "a_creer", source: "cahier",
    cta: "Enregistre l'idée pour ton réveillon", content: {},
  },
  {
    date: "2026-12-12", time: "11:00", format: "carrousel", title: "Quel bouquet pour quelle personnalité ? (6 slides)",
    hook: "Quel bouquet pour qui ? En 6 slides", pillar: "Expertise", objective: "Apporter de la valeur", status: "a_creer", source: "declinaison", content: {},
  },
  {
    date: "2026-12-13", time: "10:00", format: "story", title: "Sondage : quel profil es-tu ?",
    hook: "Sondage : douce ou pétillante ?", pillar: "Expertise", objective: "Créer du lien", status: "a_creer", source: "declinaison", content: {},
  },
];

async function main() {
  const { error: e1 } = await supabase.from("studio_settings").upsert(settings);
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from("studio_publications")
    .delete()
    .eq("user_id", userId)
    .gte("scheduled_date", "2026-12-07")
    .lte("scheduled_date", "2026-12-13");
  if (e2) throw e2;

  const rows = items.map((it) => ({
    user_id: userId,
    scheduled_date: it.date,
    scheduled_time: it.time,
    format: it.format,
    platforms: ["Instagram"],
    pillar: it.pillar,
    objective: it.objective,
    planned_objective: it.objective,
    kpi: KPIS[it.objective],
    title: it.title,
    hook: it.hook,
    cta: it.cta ?? "",
    caption: it.caption ?? "",
    hashtags: it.hashtags ?? "",
    style: "doux",
    content: it.content,
    status: it.status,
    source: it.source,
  }));
  const { error: e3 } = await supabase.from("studio_publications").insert(rows);
  if (e3) throw e3;
  console.log(`Semaine du 7 décembre recréée : ${rows.length} contenus pour ${userId}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
