// Couleurs propres au studio, reprises telles quelles des maquettes.
// L'interface utilise les tokens de globals.css (ivoire, sable, cacao, mocha,
// mocha-light, noir). Ces constantes ne couvrent que ce qui n'est pas un token.

/** Couleurs des piliers par position (fond, texte). */
export const PILLAR_COLORS: { bg: string; fg: string }[] = [
  { bg: "#5A3E36", fg: "#FFFEF8" },
  { bg: "#8A604F", fg: "#FFFEF8" },
  { bg: "#C9A99A", fg: "#3E2A24" },
  { bg: "#E3D3C8", fg: "#3E2A24" },
  { bg: "#A47864", fg: "#FFFEF8" },
];

/** Badges de format dans le planning. */
export const FORMAT_BADGE: Record<string, { bg: string; fg: string }> = {
  reel: { bg: "#5A3E36", fg: "#FFFEF8" },
  carrousel: { bg: "#8A604F", fg: "#FFFEF8" },
  story: { bg: "#C9A99A", fg: "#3E2A24" },
};

/** Fond sombre des bandes de vignettes (« Toutes tes slides », séquence). */
export const STRIP_BG = "#2B2422";
export const STRIP_FG = "#F1E6DE";

/** Couleurs de l'interface Instagram dans la « Vue Instagram ». */
export const INSTA = {
  text: "#262626",
  blue: "#0095F6",
  link: "#3797F0",
  border: "#DBDBDB",
  dotOff: "#C7C7C7",
  muted: "#8E8E8E",
};

/** Statuts : libellé et couleurs (texte, fond). */
export const STATUS_STYLE: Record<string, { label: string; fg: string; bg: string }> = {
  a_creer: { label: "À créer", fg: "#5A3E36", bg: "#FFFEF8" },
  a_relire: { label: "À relire", fg: "#FFFEF8", bg: "#8A604F" },
  cree: { label: "Créé", fg: "#3E2A24", bg: "#F5F2ED" },
  programme: { label: "Programmé", fg: "#FFFEF8", bg: "#8A604F" },
  publie: { label: "Publié", fg: "#3E2A24", bg: "#E3D3C8" },
};

export function pillarColor(index: number) {
  return PILLAR_COLORS[((index % PILLAR_COLORS.length) + PILLAR_COLORS.length) % PILLAR_COLORS.length];
}
