"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FREE_REWRITES, LAYOUTS, MAX_SLIDES, MIN_SLIDES, REFERENCE_STYLE, STYLES } from "@/lib/studio/constants";
import { styleSwatch, titleCss, type Look } from "@/lib/studio/look";
import { STRIP_BG, STRIP_FG } from "@/lib/studio/theme";
import type { ReferenceStyle, Slide, StudioPublication, StudioSettings, StudioStyleId } from "@/types/studio";
import { CreditsDialog } from "../CreditsDialog";
import { FontLoader } from "../FontLoader";
import { InstaPost, LAYOUT_NAME, SlideThumb, SlideView } from "../render/SlideView";
import { card, field, muted, textarea, uploadFile } from "../ui";
import {
  EditorTitle, KpiChip, ObjectiveAlert, ObjectiveSelect, PillarChip, SaveState, ViewToggle,
  dayLabel, useAutosave, useGenerate, useIsMobile,
} from "./common";
import { downloadAll, exportNodes, slugify } from "./exportImages";

const panel = `${card} flex flex-col p-5`;
const h2 = "m-0 font-serif text-[26px] font-semibold text-[var(--cacao)]";
const lbl = "text-[13px] font-bold text-[var(--noir)]";
const stripBtn = "min-h-8 rounded-full border bg-transparent px-2.5 text-xs disabled:opacity-40";

const DEMO_REFS = [
  ["#F3E7DF", "#3E2A24", "Guide", "Le petit guide du bouquet"],
  ["#F3E7DF", "#3E2A24", "01", "Choisis la saison"],
  ["#8E4E45", "#FBF7F0", "02", "Joue les textures"],
  ["#F3E7DF", "#3E2A24", "03", "Ose le vide"],
];

export type CarouselEditorProps = {
  pub: StudioPublication;
  settings: StudioSettings;
  objectiveCounts: Record<string, number>;
  remainingPlanned: number;
  imageGeneration: boolean;
};

export function CarouselEditor({ pub, settings, objectiveCounts, remainingPlanned, imageGeneration }: CarouselEditorProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [slides, setSlides] = useState<Slide[]>(pub.content.slides ?? []);
  const [sel, setSel] = useState(0);
  const [style, setStyle] = useState<StudioStyleId>(pub.style);
  const [view, setView] = useState<"editor" | "insta">("editor");
  const [objective, setObjective] = useState(pub.objective);
  const [caption, setCaption] = useState(pub.caption);
  const [hashtags, setHashtags] = useState(pub.hashtags);
  const [altText, setAltText] = useState(pub.alt_text);
  const [hook, setHook] = useState(pub.hook);
  const [cta, setCta] = useState(pub.cta);
  const [rewrites, setRewrites] = useState(pub.rewrites_used);
  const [rewriting, setRewriting] = useState(false);
  const [refStyle, setRefStyle] = useState<ReferenceStyle | null>(settings.reference_style);
  const [refs, setRefs] = useState<string[]>([]);
  const [refLink, setRefLink] = useState("");
  const [demo, setDemo] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [justAnalyzed, setJustAnalyzed] = useState(!!settings.reference_style);
  const [adapting, setAdapting] = useState(false);
  const [adapted, setAdapted] = useState(false);
  const [status, setStatus] = useState(pub.status);
  const [exporting, setExporting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [mtab, setMtab] = useState(0);
  const gen = useGenerate();
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const look: Look = { ...settings, reference_style: refStyle };
  const created = status !== "a_creer";
  const saveState = useAutosave(
    pub.id,
    { content: { slides }, caption, hashtags, alt_text: altText, style, objective, hook, cta },
    created,
  );

  const n = slides.length;
  const i = Math.min(sel, Math.max(0, n - 1));
  const cs = slides[i];
  const left = FREE_REWRITES - rewrites;
  const lay = cs?.layout;
  const programmed = status === "programme" || status === "publie";

  const upd = (patch: Partial<Slide>) => setSlides((a) => a.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const setAll = (a: Slide[], s: number) => { setSlides(a); setSel(s); };

  async function create() {
    const r = await gen.run(pub.id);
    if (r === "credits") setCreditsOpen(true);
    if (r === "ok") router.refresh();
  }

  async function regen() {
    if (left <= 0 || rewriting) return;
    setRewriting(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/rewrite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pub.id, index: i, items: slides }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      upd(json.item);
      setRewrites(json.rewrites_used);
    } catch (e) {
      setError((e as Error).message || "La réécriture n'a pas abouti.");
    } finally {
      setRewriting(false);
    }
  }

  async function adapt() {
    setAdapting(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/adapt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pub.id, objective }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setHook(json.hook);
      setCta(json.cta);
      setSlides((a) =>
        a.map((x, k) => (k === 0 && json.hook ? { ...x, title: json.hook } : k === a.length - 1 && x.layout === "cta" && json.cta ? { ...x, title: json.cta } : x)),
      );
      setAdapted(true);
    } catch (e) {
      setError((e as Error).message || "L'adaptation n'a pas abouti.");
    } finally {
      setAdapting(false);
    }
  }

  function changeObjective(v: string) {
    setObjective(v);
    setAdapted(false);
  }

  async function onRefFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    if (!files.length) return;
    setError(null);
    setDemo(false);
    setJustAnalyzed(false);
    try {
      const up = await Promise.all(files.map((f) => uploadFile(f, "reference")));
      setRefs(up.map((u) => u.url));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demo ? { demo: true } : refs.length ? { urls: refs } : { link: refLink }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setRefStyle(json.reference_style);
      setJustAnalyzed(true);
      setStyle("ref");
    } catch (e) {
      setError((e as Error).message || "L'analyse n'a pas abouti.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function resetRef() {
    await fetch("/api/studio/reference", { method: "DELETE" });
    setRefStyle(null);
    setJustAnalyzed(false);
    setDemo(false);
    setRefs([]);
    setRefLink("");
    if (style === "ref") setStyle(settings.default_style === "ref" ? "doux" : settings.default_style);
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    try {
      const { url } = await uploadFile(f, "photo");
      upd({ photo_url: url, photo_label: f.name, generated: false, layout: lay === "cover" || lay === "photo" ? lay : "photo" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  async function validate() {
    if (programmed || exporting) return;
    setExporting(true);
    setError(null);
    try {
      const nodes = exportRefs.current.slice(0, n).filter(Boolean) as HTMLDivElement[];
      const { urls, dataUrls } = await exportNodes(nodes, 3, slugify(pub.title));
      const res = await fetch(`/api/studio/publications/${pub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { slides }, caption, hashtags, alt_text: altText, style, objective, export_urls: urls, status: "programme" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setImages(dataUrls);
      setStatus("programme");
    } catch (e) {
      setError((e as Error).message || "L'export n'a pas abouti. Réessaie.");
    } finally {
      setExporting(false);
    }
  }

  // ---------- Blocs ----------

  const objChanged = objective !== pub.planned_objective;
  const header = (
    <EditorTitle kind="Créer ton carrousel" pub={pub}>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <PillarChip pub={pub} settings={settings} />
        <ObjectiveSelect id="car-obj" value={objective} onChange={changeObjective} />
        <KpiChip format="carrousel" objective={objective} />
      </div>
      {objChanged && (
        <ObjectiveAlert pub={pub} objective={objective} count={objectiveCounts[objective] ?? 0} onReset={() => changeObjective(pub.planned_objective)} onAdapt={adapt} adapting={adapting} adapted={adapted} />
      )}
    </EditorTitle>
  );

  if (!created || !cs) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-[22px] px-4 pb-16 pt-8 sm:px-8">
        <FontLoader custom={settings.custom_fonts} />
        {header}
        <div className={`${card} flex max-w-[620px] flex-col items-start gap-3 p-6`}>
          <h2 className={h2}>Ce carrousel n&apos;est pas encore créé</h2>
          <p className={`m-0 text-[15px] ${muted}`}>
            Le studio écrit tes slides, ta légende et tes hashtags à partir de ce brief, à ta charte. Tu pourras tout relire et modifier ensuite.
          </p>
          {gen.error && <p role="alert" className="m-0 text-sm text-[var(--cacao)]">{gen.error}</p>}
          <button type="button" onClick={create} disabled={gen.busy} className="min-h-[52px] rounded-full border-none bg-[var(--cacao)] px-6 text-[15px] font-bold text-[var(--ivoire)] disabled:opacity-60">
            {gen.busy ? "Création en cours…" : "Créer mon carrousel"}
          </button>
          <span className={`text-[13px] ${muted}`}>Ce carrousel utilise 1 crédit, quel que soit le nombre de slides.</span>
        </div>
        {creditsOpen && <CreditsDialog title={pub.title} remainingPlanned={remainingPlanned} onClose={() => setCreditsOpen(false)} />}
      </div>
    );
  }

  const preview =
    view === "insta" ? (
      <InstaPost look={look} dots={n} sel={i} caption={caption}>
        <SlideView slide={cs} index={i} total={n} style={style} look={look} variant="insta" />
      </InstaPost>
    ) : (
      <SlideView slide={cs} index={i} total={n} style={style} look={look} />
    );

  const nav = (
    <div className="flex items-center gap-2.5">
      <button type="button" onClick={() => setSel((i - 1 + n) % n)} aria-label="Slide précédente" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)]">
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      <span className="min-w-20 text-center text-sm">Slide {i + 1} / {n}</span>
      <button type="button" onClick={() => setSel((i + 1) % n)} aria-label="Slide suivante" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)]">
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );

  const texts = (
    <div className={`${card} flex flex-[1_1_280px] min-w-0 flex-col gap-3 px-5 py-[18px]`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className={h2}>Textes de la slide {i + 1}</h2>
        <span className={`text-xs ${muted}`}>{LAYOUT_NAME[lay]}</span>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="kicker" className={lbl}>Surtitre</label>
        <input id="kicker" type="text" className={`${field} text-sm`} value={cs.kicker} onChange={(e) => upd({ kicker: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="titre" className={lbl}>Titre</label>
        <textarea id="titre" rows={2} className={`${textarea} resize-y text-sm`} value={cs.title} onChange={(e) => upd({ title: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="texte" className={lbl}>{lay === "list" ? "Éléments de la liste (un par ligne)" : lay === "quote" ? "Nom de la cliente ou précision" : "Texte"}</label>
        <textarea id="texte" rows={4} className={`${textarea} resize-y text-sm`} value={cs.body} onChange={(e) => upd({ body: e.target.value })} />
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={regen}
          disabled={left <= 0 || rewriting}
          className={left > 0
            ? "min-h-10 rounded-full border-none bg-[var(--mocha)] px-3.5 text-[13px] font-bold text-[var(--ivoire)] disabled:opacity-60"
            : "min-h-10 rounded-full border border-[var(--mocha)]/40 bg-[var(--sable)] px-3.5 text-[13px] font-bold text-[var(--mocha)]"}
        >
          {rewriting ? "Réécriture…" : "Réécrire cette slide"}
        </button>
        <span className={`text-xs ${muted}`}>
          {left > 0 ? `${left} réécriture${left > 1 ? "s" : ""} gratuite${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}` : "Tu peux encore modifier le texte toi-même."}
        </span>
      </div>
    </div>
  );

  const strip = (
    <div className="flex flex-col gap-2.5 rounded-[18px] px-4 py-3.5" style={{ background: STRIP_BG, color: STRIP_FG }}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold">Toutes tes slides</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { t: "← Déplacer", a: "Déplacer la slide vers la gauche", d: i === 0, f: () => { const a = slides.slice(); [a[i - 1], a[i]] = [a[i], a[i - 1]]; setAll(a, i - 1); } },
            { t: "Déplacer →", a: "Déplacer la slide vers la droite", d: i >= n - 1, f: () => { const a = slides.slice(); [a[i + 1], a[i]] = [a[i], a[i + 1]]; setAll(a, i + 1); } },
            { t: "Dupliquer", a: undefined, d: n >= MAX_SLIDES, f: () => { const a = slides.slice(); a.splice(i + 1, 0, { ...cs }); setAll(a, i + 1); } },
            { t: "Supprimer", a: undefined, d: n <= MIN_SLIDES, f: () => setAll(slides.filter((_, k) => k !== i), Math.max(0, i - 1)) },
          ].map((b) => (
            <button key={b.t} type="button" onClick={b.f} disabled={b.d} aria-label={b.a} className={stripBtn} style={{ borderColor: "rgba(241,230,222,0.4)", color: STRIP_FG }}>{b.t}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {slides.map((x, k) => (
          <SlideThumb key={k} slide={x} n={k + 1} style={style} look={look} on={k === i} onClick={() => setSel(k)} />
        ))}
        <button
          type="button"
          disabled={n >= MAX_SLIDES}
          onClick={() => { const a = slides.slice(); a.splice(i + 1, 0, { layout: "text", kicker: "Nouvelle slide", title: "Ton titre ici", body: "Ton texte ici.", tone: "light", photo_url: null, photo_label: "", generated: false }); setAll(a, i + 1); }}
          className="aspect-[4/5] w-[88px] flex-none rounded-[10px] bg-transparent text-xs disabled:opacity-40"
          style={{ border: "1.5px dashed rgba(241,230,222,0.5)", color: STRIP_FG }}
        >
          + Slide
        </button>
      </div>
    </div>
  );

  const captionBlock = (
    <div className={`${card} flex flex-col gap-3 px-5 py-[18px]`}>
      <h2 className={h2}>Légende et publication</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="leg" className={lbl}>Légende</label>
        <textarea id="leg" rows={5} className={`${textarea} resize-y p-3 text-sm`} value={caption} onChange={(e) => setCaption(e.target.value)} />
        <span className={`text-xs ${muted}`}>{caption.length} caractères · les 125 premiers s&apos;affichent avant « plus »</span>
      </div>
      <div className="flex flex-wrap gap-3.5">
        <div className="flex flex-[1_1_240px] flex-col gap-1">
          <label htmlFor="tags" className={lbl}>Hashtags</label>
          <input id="tags" type="text" className={`${field} text-sm`} value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
        </div>
        <div className="flex flex-[1_1_240px] flex-col gap-1">
          <label htmlFor="alt" className={lbl}>Texte alternatif</label>
          <input id="alt" type="text" className={`${field} text-sm`} value={altText} onChange={(e) => setAltText(e.target.value)} />
        </div>
      </div>
    </div>
  );

  const styleIds: StudioStyleId[] = [...STYLES.map((s) => s.id), ...(refStyle ? (["ref"] as StudioStyleId[]) : [])];
  const hasRefs = refs.length > 0 || demo || !!refLink;
  const stylePanel = (
    <div className={`${panel} gap-3.5`}>
      <div className="flex flex-col gap-0.5">
        <h2 className={h2}>1. Style du carrousel</h2>
        <span className={`text-[13px] ${muted}`}>Appliqué à toutes les slides, à ta charte.</span>
      </div>
      <div role="group" aria-label="Styles de carrousel" className="grid grid-cols-2 gap-2.5">
        {styleIds.map((id) => {
          const def = id === "ref" ? REFERENCE_STYLE : STYLES.find((s) => s.id === id)!;
          const on = id === style;
          const sw = styleSwatch(id, look);
          return (
            <button key={id} type="button" aria-pressed={on} onClick={() => setStyle(id)}
              className={`flex flex-col gap-1.5 rounded-[14px] bg-[var(--ivoire)] p-2.5 text-left text-[var(--cacao)] ${on ? "border-2 border-[var(--cacao)]" : "border border-[var(--mocha-light)]"}`}>
              <span className="flex h-14 items-center justify-center border border-[var(--mocha-light)]" style={{ borderRadius: Math.min(id === "ref" ? refStyle?.radius ?? 2 : def.radius, 10), background: sw.bg, color: sw.fg }}>
                <span style={titleCss(id, look, def.titleUppercase ? 24 : 28)}>{def.sample}</span>
              </span>
              <span className="text-sm font-bold">{def.name}</span>
              <span className={`text-xs leading-[1.35] ${muted}`}>{def.desc}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2.5 rounded-[14px] bg-[var(--sable)] p-3.5">
        <span className="text-[15px] font-bold">Montre-moi un carrousel que tu aimes</span>
        <span className={`text-xs ${muted}`}>Dépose des captures de ses slides ou colle son lien. Seul le style est repris (mise en page, typographie, couleurs adaptées à ta charte), jamais le contenu.</span>
        <label htmlFor="refimg" className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[var(--mocha)] bg-[var(--ivoire)] text-sm font-bold">Déposer des captures d&apos;écran</label>
        <input id="refimg" type="file" accept="image/*" multiple onChange={onRefFiles} className="text-xs" />
        <div className="flex gap-2">
          <label htmlFor="reflink" className="sr-only">Lien du carrousel</label>
          <input id="reflink" type="url" value={refLink} onChange={(e) => { setRefLink(e.target.value); setRefs([]); setDemo(false); setJustAnalyzed(false); }} placeholder="Ou colle le lien du post" className={`${field} min-w-0 flex-1 text-[13px]`} />
        </div>
        <button type="button" onClick={() => { setDemo(true); setRefs([]); setRefLink(""); setJustAnalyzed(false); }} className="min-h-10 rounded-full border border-[var(--mocha)]/40 bg-transparent text-[13px] text-[var(--cacao)]">Essayer avec un exemple</button>
        {hasRefs && !justAnalyzed && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold">Ta référence</span>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {refs.length > 0
                ? refs.map((u, k) => (
                    <div key={u} className="aspect-[4/5] w-[76px] flex-none overflow-hidden rounded-md border border-[var(--mocha-light)] bg-[var(--ivoire)]">
                      <img src={u} alt={`Capture de référence ${k + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))
                : demo
                  ? DEMO_REFS.map((d, k) => (
                      <div key={k} className="box-border flex aspect-[4/5] w-[76px] flex-none flex-col gap-1 rounded-[2px] p-[7px]" style={{ background: d[0], color: d[1] }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: 600, fontStyle: "italic", color: d[0] === "#8E4E45" ? "#E9B8B0" : "#8E4E45" }}>{d[2]}</span>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, fontWeight: 600, lineHeight: 1.05 }}>{d[3]}</span>
                        <span className="mt-auto h-px opacity-40" style={{ background: "currentColor" }} />
                      </div>
                    ))
                  : <span className={`text-xs ${muted}`}>{refLink}</span>}
            </div>
            <button type="button" onClick={analyze} disabled={analyzing} className="min-h-11 rounded-full border-none bg-[var(--cacao)] text-sm font-bold text-[var(--ivoire)] disabled:opacity-60">
              {analyzing ? "Analyse en cours…" : "Analyser et appliquer ce style"}
            </button>
          </div>
        )}
        {justAnalyzed && refStyle && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold">Repéré et appliqué à ton carrousel :</span>
            <div className="flex flex-wrap gap-1.5">
              {refStyle.traits.map((t) => (
                <span key={t} className="rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] px-2.5 py-1 text-xs font-bold">{t}</span>
              ))}
            </div>
            <button type="button" onClick={resetRef} className="min-h-9 self-start rounded-full border-none bg-transparent px-3 text-xs text-[var(--cacao)] underline">Changer de référence</button>
          </div>
        )}
      </div>
    </div>
  );

  const layoutPanel = (
    <div className={`${panel} gap-3`}>
      <div className="flex flex-col gap-0.5">
        <h2 className={h2}>2. Mise en page de la slide {i + 1}</h2>
        <span className={`text-[13px] ${muted}`}>Chaque slide peut avoir sa propre mise en page.</span>
      </div>
      <div role="group" aria-label="Mises en page" className="grid grid-cols-3 gap-2">
        {LAYOUTS.map((l) => {
          const on = l.id === lay;
          return (
            <button key={l.id} type="button" aria-pressed={on} onClick={() => upd({ layout: l.id })}
              className={`flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-xl bg-[var(--ivoire)] px-1 py-2 text-[var(--cacao)] ${on ? "border-2 border-[var(--cacao)]" : "border border-[var(--mocha-light)]"}`}>
              <span aria-hidden="true" className="box-border flex h-[42px] w-[34px] flex-col gap-[3px] rounded bg-[var(--sable)] p-1">
                {l.bars.map((b, k) => (
                  <span key={k} className="block rounded-[2px] bg-[var(--mocha)]" style={Object.fromEntries(b.split(";").map((p) => p.split(":")).map(([a, v]) => [a.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()]))} />
                ))}
              </span>
              <span className="text-center text-xs font-bold leading-[1.2]">{l.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const visualPanel = (
    <div className={`${panel} gap-2.5`}>
      <div className="flex flex-col gap-0.5">
        <h2 className={h2}>3. Visuel de la slide {i + 1}</h2>
        <span className={`text-[13px] ${muted}`}>
          {lay === "cover" || lay === "photo" ? "Ta propre photo rend le carrousel plus authentique." : "Cette mise en page n’affiche pas de photo. Choisis « Couverture » ou « Photo + texte » pour en ajouter une."}
        </span>
      </div>
      <label htmlFor="photo" className="flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--cacao)] text-sm font-bold text-[var(--ivoire)]">Ajouter ma photo</label>
      <input id="photo" type="file" accept="image/*" onChange={onPhoto} className="text-xs" />
      <div className="flex gap-2">
        <button type="button" disabled={!imageGeneration} aria-label={imageGeneration ? undefined : "Générer un visuel : bientôt disponible"}
          className="min-h-11 flex-1 rounded-full border border-[var(--cacao)] bg-transparent text-[13px] text-[var(--cacao)] disabled:cursor-not-allowed disabled:opacity-50">
          {imageGeneration ? "Générer un visuel" : "Bientôt disponible"}
        </button>
        <button type="button" onClick={() => upd({ photo_url: null, photo_label: "", generated: false })} className="min-h-11 flex-1 rounded-full border border-[var(--mocha)]/40 bg-transparent text-[13px] text-[var(--cacao)]">Sans visuel</button>
      </div>
    </div>
  );

  const validateBlock = (
    <div className="flex flex-col gap-2.5">
      {programmed && (
        <span role="status" className="rounded-[14px] bg-[var(--sable)] px-4 py-3 text-center text-sm font-bold">
          Carrousel validé, programmé {dayLabel(pub.scheduled_date).toLowerCase()} à {pub.scheduled_time}
        </span>
      )}
      {error && <p role="alert" className="m-0 text-center text-sm text-[var(--cacao)]">{error}</p>}
      <button type="button" onClick={validate} disabled={programmed || exporting}
        className={programmed
          ? "min-h-[52px] rounded-full border border-[var(--mocha)]/40 bg-[var(--sable)] text-[15px] font-bold text-[var(--mocha)]"
          : "min-h-[52px] rounded-full border-none bg-[var(--cacao)] text-[15px] font-bold text-[var(--ivoire)] disabled:opacity-60"}>
        {exporting ? "Export des images…" : "Valider et programmer"}
      </button>
      {programmed && (images.length > 0 || pub.export_urls.length > 0) && (
        <button type="button" onClick={() => (images.length ? downloadAll(images, slugify(pub.title)) : pub.export_urls.forEach((u) => window.open(u, "_blank")))}
          className="min-h-11 rounded-full border border-[var(--cacao)] bg-transparent text-sm text-[var(--cacao)]">
          Télécharger mes images
        </button>
      )}
      <span className={`text-center text-[13px] ${muted}`}>Ce carrousel utilise 1 crédit, quel que soit le nombre de slides.</span>
      <SaveState state={saveState} />
    </div>
  );

  // Rendu hors écran, en taille de référence, pour l'export PNG 1080 × 1350.
  const exportArea = (
    <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
      {slides.map((s, k) => (
        <div key={k} ref={(el) => { exportRefs.current[k] = el; }} style={{ width: 360 }}>
          <SlideView slide={s} index={k} total={n} style={style} look={look} variant="export" />
        </div>
      ))}
    </div>
  );

  const shared = (
    <>
      <FontLoader custom={settings.custom_fonts} />
      {exportArea}
      {creditsOpen && <CreditsDialog title={pub.title} remainingPlanned={remainingPlanned} onClose={() => setCreditsOpen(false)} />}
    </>
  );

  if (isMobile) {
    const tabs = ["Textes", "1. Style", "2. Mise en page", "3. Visuel", "Légende"];
    return (
      <div className="flex flex-col gap-3 px-4 pb-32 pt-4">
        {shared}
        {header}
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-full max-w-[300px]">{preview}</div>
          <ViewToggle view={view} setView={setView} />
        </div>
        {strip}
        <div role="tablist" aria-label="Réglages" className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t, k) => (
            <button key={t} type="button" role="tab" aria-selected={k === mtab} onClick={() => setMtab(k)}
              className={`min-h-11 flex-none rounded-full px-3.5 text-[13px] font-bold ${k === mtab ? "bg-[var(--cacao)] text-[var(--ivoire)]" : "border border-[var(--mocha)]/40 text-[var(--cacao)]"}`}>
              {t}
            </button>
          ))}
        </div>
        <div role="tabpanel">{[texts, stylePanel, layoutPanel, visualPanel, captionBlock][mtab]}</div>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--mocha-light)] bg-[var(--ivoire)] px-4 py-3">{validateBlock}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-[22px] px-8 pb-16 pt-8">
      {shared}
      <div className="flex flex-wrap items-end justify-between gap-4">
        {header}
        <ViewToggle view={view} setView={setView} />
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_660px] flex-col gap-[18px]">
          <div className="flex flex-wrap items-stretch gap-5">
            <div className="flex min-w-0 flex-[0_1_360px] flex-col items-center gap-2.5">
              {preview}
              {nav}
            </div>
            {texts}
          </div>
          {strip}
          {captionBlock}
        </div>
        <aside aria-label="Réglages du carrousel" className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          {stylePanel}
          {layoutPanel}
          {visualPanel}
          {validateBlock}
        </aside>
      </div>
    </div>
  );
}
