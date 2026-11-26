import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { KPIS, MAX_FRAMES, MAX_SLIDES, MIN_SLIDES } from "@/lib/studio/constants";
import type {
  Elements,
  ReferenceStyle,
  Slide,
  SlideLayout,
  SlideTone,
  StickerKind,
  StoryFrame,
  StudioPublication,
  StudioSettings,
} from "@/types/studio";

/** Modèle utilisé pour tous les textes du studio. */
export const STUDIO_MODEL = "claude-sonnet-4-6";

export class GenerationError extends Error {}

const LAYOUT_IDS: SlideLayout[] = ["cover", "photo", "text", "list", "quote", "cta"];
const TONES: SlideTone[] = ["dark", "light", "pink"];
const STICKERS: StickerKind[] = ["none", "poll", "question", "quiz", "countdown", "link"];

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new GenerationError("La génération n'est pas configurée (ANTHROPIC_API_KEY manquante).");
  return new Anthropic({ apiKey });
}

function system(settings: StudioSettings) {
  return `Tu écris les contenus Instagram d'une entrepreneure, à sa place, pour son audience.

SON ACTIVITÉ : ${settings.activity || "non précisée"}
SA CIBLE : ${settings.audience || "non précisée"}
SON TON : ${settings.tone || "chaleureux et direct"}
SES PILIERS : ${settings.pillars.map((p) => `${p.name} (${p.description})`).join(" ; ")}

RÈGLES :
- Toujours en français, en tutoyant son audience, dans son ton.
- Phrases courtes, concrètes, sans jargon marketing ni promesses exagérées.
- Pas de tirets pour faire des listes dans la légende : de la prose fluide, quelques emojis au plus.
- L'accroche et l'appel à l'action servent l'objectif du contenu.
- Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour ni bloc de code.`;
}

function brief(pub: StudioPublication) {
  return `BRIEF DU CONTENU
Titre : ${pub.title}
Pilier : ${pub.pillar}
Objectif : ${pub.objective} (indicateur à suivre : ${KPIS[pub.objective] ?? ""})
Accroche souhaitée : ${pub.hook || "à proposer"}
Appel à l'action : ${pub.cta || "à proposer, adapté à l'objectif"}
Idée de visuel : ${pub.visual_idea || "libre"}`;
}

async function askJson<T>(sys: string, content: Anthropic.MessageParam["content"], maxTokens = 2500): Promise<T> {
  const c = client();
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await c.messages.create({ model: STUDIO_MODEL, max_tokens: maxTokens, system: sys, messages: [{ role: "user", content }] });
      const block = res.content.find((b) => b.type === "text");
      if (!block || block.type !== "text") throw new Error("Réponse vide");
      const raw = block.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      return JSON.parse(raw.slice(start, end + 1)) as T;
    } catch (e) {
      lastError = e;
    }
  }
  console.error("[studio] génération impossible", lastError);
  throw new GenerationError("La création n'a pas abouti. Réessaie dans un instant : aucun crédit n'a été utilisé.");
}

const hexOrNull = (v: unknown) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : null);
const EL_KEYS = ["kicker", "title", "body", "cta", "sub", "sticker"] as const;
function cleanElements(v: unknown): Elements | undefined {
  if (!v || typeof v !== "object") return undefined;
  const out: Elements = {};
  for (const k of EL_KEYS) {
    const e = (v as Record<string, Record<string, unknown>>)[k];
    if (!e || typeof e !== "object") continue;
    const num = (n: unknown) => (typeof n === "number" && n >= 0 && n <= 100 ? n : null);
    const scale = typeof e.scale === "number" ? Math.min(2.5, Math.max(0.5, e.scale)) : 1;
    out[k] = { x: num(e.x), y: num(e.y), color: hexOrNull(e.color), scale };
  }
  return out;
}
const str = (v: unknown, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanSlide(raw: Record<string, unknown>, keep?: Partial<Slide>): Slide {
  const layout = LAYOUT_IDS.includes(raw.layout as SlideLayout) ? (raw.layout as SlideLayout) : keep?.layout ?? "text";
  return {
    layout,
    kicker: str(raw.kicker, 40),
    title: str(raw.title, 140) || keep?.title || "",
    body: str(raw.body, 400),
    tone: TONES.includes(raw.tone as SlideTone) ? (raw.tone as SlideTone) : keep?.tone ?? "light",
    photo_url: keep?.photo_url ?? null,
    photo_label: keep?.photo_label ?? str(raw.photo_label, 120),
    generated: keep?.generated ?? false,
    bg_color: hexOrNull(keep?.bg_color),
    text_color: hexOrNull(keep?.text_color),
    elements: cleanElements(keep?.elements),
  };
}

export function cleanFrame(raw: Record<string, unknown>, keep?: Partial<StoryFrame>): StoryFrame {
  const sticker = STICKERS.includes(raw.sticker as StickerKind) ? (raw.sticker as StickerKind) : keep?.sticker ?? "none";
  const bg = raw.bg === "photo" ? "photo" : keep?.bg ?? "color";
  return {
    title: str(raw.title, 120),
    sub: str(raw.sub, 120),
    sticker,
    sticker_text: str(raw.sticker_text, 80),
    opt_a: str(raw.opt_a, 40),
    opt_b: str(raw.opt_b, 40),
    bg,
    photo_url: keep?.photo_url ?? null,
    photo_label: keep?.photo_label ?? str(raw.photo_label, 120),
    tone: TONES.includes(raw.tone as SlideTone) ? (raw.tone as SlideTone) : keep?.tone ?? "dark",
    bg_color: hexOrNull(keep?.bg_color),
    text_color: hexOrNull(keep?.text_color),
    elements: cleanElements(keep?.elements),
  };
}

const SLIDE_SCHEMA = `{"layout": "cover|photo|text|list|quote|cta", "kicker": "surtitre court (2 à 4 mots)", "title": "titre (12 mots max)", "body": "texte court (25 mots max). Pour layout list : 3 à 5 éléments séparés par \\n. Pour quote : le nom de la cliente", "tone": "dark|light|pink", "photo_label": "description de la photo idéale si layout cover ou photo, sinon vide"}`;

export async function generateCarousel(pub: StudioPublication, settings: StudioSettings) {
  const out = await askJson<{ slides: Record<string, unknown>[]; caption: string; hashtags: string; alt_text: string }>(
    system(settings),
    `${brief(pub)}

Crée un carrousel Instagram de 5 à 7 slides.
- Slide 1 : layout "cover", tone "dark", le titre est l'accroche.
- Dernière slide : layout "cta", tone "dark", le titre est l'appel à l'action.
- Entre les deux : alterne "photo", "text", "list" (et "quote" seulement si un avis client a du sens), tones "light" ou "pink".
- Une idée par slide.

Réponds avec ce JSON :
{"slides": [${SLIDE_SCHEMA}], "caption": "légende Instagram (les 125 premiers caractères donnent envie, 600 caractères max, termine par l'appel à l'action)", "hashtags": "5 hashtags séparés par des espaces", "alt_text": "texte alternatif décrivant le carrousel (150 caractères max)"}`,
  );
  const slides = (Array.isArray(out.slides) ? out.slides : []).slice(0, MAX_SLIDES).map((s) => cleanSlide(s));
  if (slides.length < MIN_SLIDES) throw new GenerationError("La création n'a pas abouti. Réessaie dans un instant : aucun crédit n'a été utilisé.");
  return { slides, caption: str(out.caption, 2200), hashtags: str(out.hashtags, 300), alt_text: str(out.alt_text, 300) };
}

const FRAME_SCHEMA = `{"title": "texte principal (8 mots max)", "sub": "petit texte (10 mots max, peut être vide)", "sticker": "none|poll|question|quiz|countdown|link", "sticker_text": "question du quiz, texte de la boîte à questions, nom de l'événement ou texte du lien (vide pour none et poll)", "opt_a": "réponse 1 (sondage ou quiz)", "opt_b": "réponse 2 (sondage ou quiz)", "bg": "photo|color", "photo_label": "description de la photo idéale si bg photo", "tone": "dark|light|pink"}`;

export async function generateStory(pub: StudioPublication, settings: StudioSettings, count = 3) {
  const out = await askJson<{ frames: Record<string, unknown>[] }>(
    system(settings),
    `${brief(pub)}

Crée une séquence de ${count} visuels de story Instagram qui se suivent.
- Le premier visuel accroche (bg "photo" de préférence).
- Au moins un visuel porte un élément interactif adapté à l'objectif (sondage ou question pour créer du lien, quiz pour apporter de la valeur, compte à rebours ou lien pour faire passer à l'action).
- Alterne les tones.

Réponds avec ce JSON : {"frames": [${FRAME_SCHEMA}]}`,
  );
  const frames = (Array.isArray(out.frames) ? out.frames : []).slice(0, Math.min(count, MAX_FRAMES)).map((f) => cleanFrame(f));
  if (!frames.length) throw new GenerationError("La création n'a pas abouti. Réessaie dans un instant : aucun crédit n'a été utilisé.");
  return { frames };
}

export async function rewriteSlide(pub: StudioPublication, settings: StudioSettings, slides: Slide[], index: number) {
  const cur = slides[index];
  const out = await askJson<Record<string, unknown>>(
    system(settings),
    `${brief(pub)}

Voici le carrousel actuel : ${JSON.stringify(slides.map((s) => ({ layout: s.layout, kicker: s.kicker, title: s.title, body: s.body })))}

Réécris uniquement la slide ${index + 1} (layout "${cur.layout}") avec un angle différent et plus percutant, en gardant le même layout et le même rôle dans le carrousel.
Réponds avec ce JSON : ${SLIDE_SCHEMA}`,
    800,
  );
  return cleanSlide({ ...out, layout: cur.layout, tone: cur.tone }, cur);
}

export async function rewriteFrame(pub: StudioPublication, settings: StudioSettings, frames: StoryFrame[], index: number) {
  const cur = frames[index];
  const out = await askJson<Record<string, unknown>>(
    system(settings),
    `${brief(pub)}

Voici la séquence actuelle : ${JSON.stringify(frames.map((f) => ({ title: f.title, sub: f.sub, sticker: f.sticker })))}

Réécris uniquement le visuel ${index + 1}, avec un angle différent, en gardant le même élément interactif ("${cur.sticker}").
Réponds avec ce JSON : ${FRAME_SCHEMA}`,
    800,
  );
  return cleanFrame({ ...out, sticker: cur.sticker, tone: cur.tone, bg: cur.bg }, cur);
}

export async function adaptToObjective(pub: StudioPublication, settings: StudioSettings, objective: string) {
  const out = await askJson<{ hook: string; cta: string }>(
    system(settings),
    `${brief(pub)}

L'objectif de ce contenu devient : « ${objective} » (indicateur : ${KPIS[objective] ?? ""}).
Propose une nouvelle accroche (12 mots max) et un nouvel appel à l'action (10 mots max) adaptés à ce nouvel objectif, sur le même sujet.
Réponds avec ce JSON : {"hook": "...", "cta": "..."}`,
    500,
  );
  return { hook: str(out.hook, 140), cta: str(out.cta, 140) };
}

export async function analyzeReference(settings: StudioSettings, images: { data: string; media_type: string }[]) {
  const out = await askJson<{ traits: string[]; light_background: string; text: string; accent: string; title_italic: boolean; title_uppercase: boolean; radius: number; rule: boolean }>(
    `Tu es directrice artistique. Tu analyses le STYLE visuel de captures d'un carrousel Instagram, jamais son contenu.
Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour.`,
    [
      ...images.map((img) => ({
        type: "image" as const,
        source: { type: "base64" as const, media_type: img.media_type as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: img.data },
      })),
      {
        type: "text" as const,
        text: `Décris le style de ce carrousel pour le reproduire avec une autre charte.
Réponds avec ce JSON :
{"traits": ["4 à 5 traits visuels courts en français, 2 à 5 mots chacun, ex. « Fond rosé uni », « Numéros en italique », « Une idée par slide », « Filet fin en bas de slide »"],
 "light_background": "couleur hex du fond clair dominant",
 "text": "couleur hex du texte principal",
 "accent": "couleur hex d'accent",
 "title_italic": true|false,
 "title_uppercase": true|false,
 "radius": "arrondi des coins en px, entre 0 et 16",
 "rule": "true s'il y a des filets fins"}
Ne reprends aucun texte des captures.`,
      },
    ],
    700,
  );
  const hex = (v: unknown, d: string) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : d);
  const style: ReferenceStyle = {
    traits: (Array.isArray(out.traits) ? out.traits : []).map((t) => str(t, 40)).filter(Boolean).slice(0, 5),
    background: hex(out.light_background, "#F3E7DF"),
    text: hex(out.text, "#3E2A24"),
    accent: hex(out.accent, settings.colors.detail),
    titleItalic: !!out.title_italic,
    titleUppercase: !!out.title_uppercase,
    radius: Math.min(16, Math.max(0, Number(out.radius) || 2)),
    rule: out.rule !== false,
  };
  return style;
}

/** Style « Essayer avec un exemple » de la maquette, sans appel à l'IA. */
export const DEMO_REFERENCE: ReferenceStyle = {
  traits: ["Fond rosé uni", "Numéros en italique", "Une idée par slide", "Filet fin en bas de slide", "Coins presque droits"],
  background: "#F3E7DF",
  text: "#3E2A24",
  accent: "#8E4E45",
  titleItalic: false,
  titleUppercase: false,
  radius: 2,
  rule: true,
};
