// Types du Studio de création.

export type StudioFormat = "carrousel" | "story" | "reel";
export type StudioStatus = "a_creer" | "a_relire" | "cree" | "programme" | "publie";
export type StudioSource = "spontane" | "cahier" | "declinaison";
export type StudioStyleId = "doux" | "edito" | "magazine" | "minimal" | "ref";
export type SlideLayout = "cover" | "photo" | "text" | "list" | "quote" | "cta";
export type SlideTone = "dark" | "light" | "pink";
export type StickerKind = "none" | "poll" | "question" | "quiz" | "countdown" | "link";
export type FrameBg = "photo" | "color" | "gen";

export type StudioColors = {
  principale: string;
  accent: string;
  fond: string;
  detail: string;
}

export type StudioPillar = {
  name: string;
  description: string;
  color: string;
}

export type ReferenceStyle = {
  traits: string[];
  background: string;
  text: string;
  accent: string;
  titleItalic: boolean;
  titleUppercase: boolean;
  radius: number;
  rule: boolean;
}

export type StudioSettings = {
  user_id: string;
  activity: string;
  audience: string;
  handle: string;
  tone: string;
  logo_url: string | null;
  show_logo_on_cover: boolean;
  colors: StudioColors;
  font_title: string;
  font_body: string;
  custom_fonts: { name: string; url: string }[];
  default_style: StudioStyleId;
  reference_style: ReferenceStyle | null;
  pillars: StudioPillar[];
  networks: string[];
  posts_per_week: number;
  preferred_time: string;
  updated_at: string;
  created_at: string;
}

export type Slide = {
  layout: SlideLayout;
  kicker: string;
  title: string;
  body: string;
  tone: SlideTone;
  photo_url?: string | null;
  photo_label?: string;
  generated?: boolean;
  /** Couleurs choisies par l'élève pour cette slide (sinon celles du style). */
  bg_color?: string | null;
  text_color?: string | null;
}

export type StoryFrame = {
  title: string;
  sub: string;
  sticker: StickerKind;
  sticker_text: string;
  opt_a: string;
  opt_b: string;
  bg: FrameBg;
  photo_url?: string | null;
  photo_label?: string;
  tone: SlideTone;
  bg_color?: string | null;
  text_color?: string | null;
}

export type PublicationContent = {
  slides?: Slide[];
  frames?: StoryFrame[];
}

export type StudioPublication = {
  id: string;
  user_id: string;
  scheduled_date: string;
  scheduled_time: string;
  format: StudioFormat;
  platforms: string[];
  pillar: string;
  objective: string;
  planned_objective: string;
  kpi: string;
  title: string;
  hook: string;
  cta: string;
  visual_idea: string;
  caption: string;
  hashtags: string;
  alt_text: string;
  style: StudioStyleId;
  content: PublicationContent;
  status: StudioStatus;
  source: StudioSource;
  derived_from: string | null;
  rewrites_used: number;
  export_urls: string[];
  created_at: string;
  updated_at: string;
}

export type CreditLedgerRow = {
  id: string;
  user_id: string;
  delta: number;
  bucket: "mensuel" | "pack";
  reason: string;
  publication_id: string | null;
  period: string | null;
  lot_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export type CreditBalance = {
  monthly: number;
  monthlyIncluded: number;
  monthlyUsed: number;
  pack: number;
  packExpiries: { remaining: number; expires_at: string }[];
  total: number;
}
