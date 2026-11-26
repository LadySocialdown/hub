import type { SlideLayout, StickerKind, StudioFormat, StudioStyleId } from "@/types/studio";

export const MONTHLY_CREDITS = 20;
export const FREE_REWRITES = 2;
export const MAX_SLIDES = 10;
export const MIN_SLIDES = 2;
export const MAX_FRAMES = 8;
export const PACK_VALIDITY_MONTHS = 6;

/** Objectifs de contenu et indicateur à suivre. */
export const OBJECTIVES = [
  "Faire découvrir",
  "Apporter de la valeur",
  "Créer du lien",
  "Rassurer",
  "Faire passer à l'action",
] as const;

export const KPIS: Record<string, string> = {
  "Faire découvrir": "Portée et partages",
  "Apporter de la valeur": "Enregistrements",
  "Créer du lien": "Commentaires et réponses",
  Rassurer: "Visites du profil et questions",
  "Faire passer à l'action": "Messages et clics sur le lien",
};

export const FORMAT_LABEL: Record<StudioFormat, string> = {
  carrousel: "Carrousel",
  story: "Story",
  reel: "Reel",
};

/** Lignes du planning visuel, dans l'ordre de la maquette. */
export const PLANNING_LANES: { format: StudioFormat; name: string }[] = [
  { format: "reel", name: "Reels" },
  { format: "carrousel", name: "Carrousels" },
  { format: "story", name: "Stories" },
];

export interface StyleDef {
  id: StudioStyleId;
  name: string;
  desc: string;
  storyName: string;
  sample: string;
  /** Styles CSS du titre (police appliquée à part). */
  titleItalic: boolean;
  titleUppercase: boolean;
  titleSerif: boolean;
  titleWeight: number;
  radius: number;
  rule: boolean;
}

export const STYLES: StyleDef[] = [
  { id: "doux", name: "Doux et lumineux", storyName: "Doux et lumineux", desc: "Serif élégante, fonds alternés, coins arrondis", sample: "Aa", titleItalic: false, titleUppercase: false, titleSerif: true, titleWeight: 700, radius: 16, rule: false },
  { id: "edito", name: "Éditorial", storyName: "Éditorial", desc: "Italique, filets fins, beaucoup d’air", sample: "Aa", titleItalic: true, titleUppercase: false, titleSerif: true, titleWeight: 600, radius: 4, rule: true },
  { id: "magazine", name: "Magazine", storyName: "Magazine", desc: "Gros titres en capitales, contrastes forts", sample: "AA", titleItalic: false, titleUppercase: true, titleSerif: false, titleWeight: 700, radius: 0, rule: false },
  { id: "minimal", name: "Minimal", storyName: "Minimal", desc: "Sans serif, fond clair, très épuré", sample: "Aa", titleItalic: false, titleUppercase: false, titleSerif: false, titleWeight: 500, radius: 10, rule: false },
];

export const REFERENCE_STYLE: StyleDef = {
  id: "ref",
  name: "Ta référence",
  storyName: "Ta référence",
  desc: "Inspiré du carrousel que tu as montré",
  sample: "Aa",
  titleItalic: false,
  titleUppercase: false,
  titleSerif: true,
  titleWeight: 600,
  radius: 2,
  rule: true,
};

/** Descriptions courtes utilisées dans les réglages. */
export const STYLE_SETTINGS_DESC: Record<string, string> = {
  doux: "Serif, fonds alternés",
  edito: "Italique, beaucoup d’air",
  magazine: "Capitales, contrastes",
  minimal: "Épuré, fond clair",
};

export const LAYOUTS: { id: SlideLayout; name: string; bars: string[] }[] = [
  { id: "cover", name: "Couverture", bars: ["height:6px;width:60%", "flex:1"] },
  { id: "photo", name: "Photo + texte", bars: ["height:4px;width:70%", "flex:1", "height:3px;width:90%"] },
  { id: "text", name: "Texte seul", bars: ["height:5px;width:80%", "height:3px;width:100%", "height:3px;width:90%", "height:3px;width:70%"] },
  { id: "list", name: "Liste", bars: ["height:4px;width:70%", "height:3px;width:85%", "height:3px;width:85%", "height:3px;width:85%"] },
  { id: "quote", name: "Avis client", bars: ["height:8px;width:20%", "height:4px;width:90%", "height:4px;width:70%"] },
  { id: "cta", name: "Appel à l'action", bars: ["height:5px;width:80%", "height:3px;width:70%", "height:7px;width:55%;border-radius:999px"] },
];

export const STICKERS: { id: StickerKind; name: string; label: string; hint: string; defaultText: string }[] = [
  { id: "none", name: "Aucun", label: "", hint: "Un sticker fait réagir : sondage, question ou quiz augmentent les réponses.", defaultText: "" },
  { id: "poll", name: "Sondage", label: "", hint: "Le sondage est parfait pour créer du lien en un clic.", defaultText: "" },
  { id: "question", name: "Question", label: "Texte de la boîte à questions", hint: "La boîte à questions te donne des idées de contenus.", defaultText: "Ta question pour moi" },
  { id: "quiz", name: "Quiz", label: "Question du quiz", hint: "Le quiz apprend en jouant, idéal pour ton expertise.", defaultText: "Ta question de quiz" },
  { id: "countdown", name: "Compte à rebours", label: "Nom de l'événement", hint: "Le compte à rebours crée l’attente avant un lancement.", defaultText: "Mon prochain lancement" },
  { id: "link", name: "Lien", label: "Texte du lien", hint: "Le lien envoie vers ta boutique ou ta prise de rendez-vous.", defaultText: "Découvrir" },
];

export const TITLE_FONTS = ["Cormorant Garamond", "Playfair Display", "Lora", "Montserrat", "Poppins"];
export const BODY_FONTS = ["DM Sans", "Montserrat", "Poppins", "Lora"];
export const SERIF_FONTS = ["Cormorant Garamond", "Playfair Display", "Lora"];

export const NETWORKS = ["Instagram", "TikTok", "Facebook", "LinkedIn", "Pinterest"];
export const PREFERRED_TIMES = ["9:00", "12:00", "18:00"];
export const POSTS_PER_WEEK = [3, 5, 7];

export const COLOR_NAMES: { key: "principale" | "accent" | "fond" | "detail"; name: string }[] = [
  { key: "principale", name: "Principale" },
  { key: "accent", name: "Accent" },
  { key: "fond", name: "Fond" },
  { key: "detail", name: "Détail" },
];

export const DEFAULT_PILLARS = [
  { name: "Expertise", description: "Conseils et savoir-faire", color: "#5A3E36" },
  { name: "Coulisses", description: "Atelier, création, quotidien", color: "#A47864" },
  { name: "Preuves", description: "Avis, réalisations, avant/après", color: "#C9A99A" },
  { name: "Offre", description: "Produits, prestations, appels à l'action", color: "#E3D3C8" },
];

export function googleFontsHref(families: string[]): string {
  const uniq = Array.from(new Set(families.filter(Boolean)));
  const q = uniq
    .map((f) => "family=" + f.replace(/ /g, "+") + ":ital,wght@0,400;0,500;0,600;0,700;1,500;1,600")
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/** Pile CSS d'une police de l'élève (Google Fonts ou police importée). */
export function fontStack(name: string): string {
  return SERIF_FONTS.includes(name) ? `'${name}', serif` : `'${name}', sans-serif`;
}

/** Indicateurs propres aux stories, quand ils diffèrent. */
export const STORY_KPIS: Record<string, string> = {
  "Créer du lien": "Réponses et votes",
};

export function kpiFor(format: string, objective: string) {
  return (format === "story" && STORY_KPIS[objective]) || KPIS[objective] || "";
}

export const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const DAY_SHORT = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
export const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** « 2026-12-11 » → Date locale (sans décalage de fuseau). */
export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
