"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { MAX_FRAMES, STICKERS, STYLES } from "@/lib/studio/constants";
import { styleSwatch, titleCss, type Look } from "@/lib/studio/look";
import { STRIP_BG, STRIP_FG } from "@/lib/studio/theme";
import type { StickerKind, StoryFrame, StudioStyleId } from "@/types/studio";
import { CreditsDialog } from "../CreditsDialog";
import { FontLoader } from "../FontLoader";
import { StoryThumb, StoryView } from "../render/StoryView";
import { card, field, muted, textarea, uploadFile } from "../ui";
import type { CarouselEditorProps } from "./CarouselEditor";
import {
  EditorTitle, KpiChip, ObjectiveAlert, ObjectiveSelect, PillarChip, SaveState,
  dayLabel, useAutosave, useGenerate, useIsMobile,
} from "./common";
import { downloadAll, exportNodes, slugify } from "./exportImages";

const panel = `${card} flex flex-col p-5`;
const h2 = "m-0 font-serif text-[26px] font-semibold text-[var(--cacao)]";
const lbl = "text-[13px] font-bold text-[var(--noir)]";
const stripBtn = "min-h-8 rounded-full border bg-transparent px-2.5 text-xs disabled:opacity-40";
const STICKER_NAME = Object.fromEntries(STICKERS.map((s) => [s.id, s.name])) as Record<StickerKind, string>;

export function StoryEditor({ pub, settings, objectiveCounts, remainingPlanned, imageGeneration }: CarouselEditorProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [frames, setFrames] = useState<StoryFrame[]>(pub.content.frames ?? []);
  const [sel, setSel] = useState(0);
  const [style, setStyle] = useState<StudioStyleId>(pub.style === "ref" ? "doux" : pub.style);
  const [objective, setObjective] = useState(pub.objective);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [status, setStatus] = useState(pub.status);
  const [count, setCount] = useState(3);
  const [adapting, setAdapting] = useState(false);
  const [adapted, setAdapted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [mtab, setMtab] = useState(0);
  const gen = useGenerate();
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const look: Look = settings;
  const created = status !== "a_creer";
  const saveState = useAutosave(pub.id, { content: { frames }, style, objective }, created);
  const n = frames.length;
  const i = Math.min(sel, Math.max(0, n - 1));
  const f = frames[i];
  const programmed = status === "programme" || status === "publie";

  const upd = (patch: Partial<StoryFrame>) => setFrames((a) => a.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const setAll = (a: StoryFrame[], s: number) => { setFrames(a); setSel(s); };

  async function create() {
    const r = await gen.run(pub.id, count);
    if (r === "credits") setCreditsOpen(true);
    if (r === "ok") router.refresh();
  }

  async function adapt() {
    setAdapting(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/adapt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pub.id, objective }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setFrames((a) => a.map((x, k) => (k === 0 && json.hook ? { ...x, title: json.hook } : k === a.length - 1 && k > 0 && json.cta ? { ...x, sub: json.cta } : x)));
      setAdapted(true);
    } catch (e) {
      setError((e as Error).message || "L'adaptation n'a pas abouti.");
    } finally {
      setAdapting(false);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const isVideo = file.type.startsWith("video/");
      const { url } = await uploadFile(file, "photo");
      upd({ bg: "photo", photo_url: isVideo ? null : url, photo_label: file.name });
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
      const { urls, dataUrls } = await exportNodes(nodes, 4, slugify(pub.title));
      const res = await fetch(`/api/studio/publications/${pub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { frames }, style, objective, export_urls: urls, status: "programme" }),
      });
      if (res.status === 402) {
        setCreditsOpen(true);
        return;
      }
      if (!res.ok) throw new Error((await res.json()).error);
      setImages(dataUrls);
      setStatus("programme");
    } catch (e) {
      setError((e as Error).message || "L'export n'a pas abouti. Réessaie.");
    } finally {
      setExporting(false);
    }
  }

  const objChanged = objective !== pub.planned_objective;
  const header = (
    <EditorTitle kind="Créer ta story" pub={pub}>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <PillarChip pub={pub} settings={settings} />
        <ObjectiveSelect id="st-obj" value={objective} onChange={(v) => { setObjective(v); setAdapted(false); }} />
        <KpiChip format="story" objective={objective} />
      </div>
      {objChanged && (
        <ObjectiveAlert pub={pub} objective={objective} count={objectiveCounts[objective] ?? 0}
          onReset={() => { setObjective(pub.planned_objective); setAdapted(false); }} onAdapt={adapt} adapting={adapting} adapted={adapted || !created} />
      )}
    </EditorTitle>
  );
  const dialog = creditsOpen && <CreditsDialog title={pub.title} remainingPlanned={remainingPlanned} onClose={() => setCreditsOpen(false)} />;

  if (!created || !f) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-[22px] px-4 pb-16 pt-8 sm:px-8">
        <FontLoader custom={settings.custom_fonts} />
        {header}
        <div className={`${card} flex max-w-[620px] flex-col items-start gap-3 p-6`}>
          <h2 className={h2}>Cette story n&apos;est pas encore créée</h2>
          <p className={`m-0 text-[15px] ${muted}`}>Le studio écrit ta séquence de stories à partir de ce brief, à ta charte, avec un élément interactif adapté à ton objectif.</p>
          <label htmlFor="st-count" className={lbl}>Nombre de visuels</label>
          <select id="st-count" className={`${field} max-w-[220px]`} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {Array.from({ length: MAX_FRAMES }, (_, k) => k + 1).map((k) => <option key={k} value={k}>{k} visuel{k > 1 ? "s" : ""}</option>)}
          </select>
          {gen.error && <p role="alert" className="m-0 text-sm text-[var(--cacao)]">{gen.error}</p>}
          <button type="button" onClick={create} disabled={gen.busy} className="min-h-[52px] rounded-full border-none bg-[var(--cacao)] px-6 text-[15px] font-bold text-[var(--ivoire)] disabled:opacity-60">
            {gen.busy ? "Création en cours…" : `Créer ma story (${count} crédit${count > 1 ? "s" : ""})`}
          </button>
          <span className={`text-[13px] ${muted}`}>Chaque visuel de la séquence utilise 1 crédit.</span>
        </div>
        {dialog}
      </div>
    );
  }

  const stickerDef = STICKERS.find((s) => s.id === f.sticker) ?? STICKERS[0];
  const hasStickerText = ["question", "quiz", "countdown", "link"].includes(f.sticker);

  const preview = (
    <div className="flex min-w-0 flex-[0_1_300px] flex-col items-center gap-2.5">
      <StoryView frame={f} index={i} total={n} style={style} look={look} vote={votes[i]} onVote={(k) => setVotes((v) => ({ ...v, [i]: k }))} />
      <span className="text-[13px]">Visuel {i + 1} / {n}</span>
    </div>
  );

  const texts = (
    <div className={`${card} flex min-w-0 flex-[1_1_280px] flex-col gap-3 px-5 py-[18px]`}>
      <h2 className={h2}>Textes du visuel {i + 1}</h2>
      <div className="flex flex-col gap-1">
        <label htmlFor="st-title" className={lbl}>Texte principal</label>
        <textarea id="st-title" rows={2} className={`${textarea} resize-y text-sm`} value={f.title} onChange={(e) => upd({ title: e.target.value })} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="st-sub" className={lbl}>Petit texte</label>
        <input id="st-sub" type="text" className={`${field} text-sm`} value={f.sub} onChange={(e) => upd({ sub: e.target.value })} />
      </div>
      {hasStickerText && (
        <div className="flex flex-col gap-1">
          <label htmlFor="st-sticker" className={lbl}>{stickerDef.label}</label>
          <input id="st-sticker" type="text" className={`${field} text-sm`} value={f.sticker_text} onChange={(e) => upd({ sticker_text: e.target.value })} />
        </div>
      )}
      {(f.sticker === "poll" || f.sticker === "quiz") && (
        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="opt-a" className={lbl}>Réponse 1</label>
            <input id="opt-a" type="text" className={`${field} min-w-0 text-sm`} value={f.opt_a} onChange={(e) => upd({ opt_a: e.target.value })} />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="opt-b" className={lbl}>Réponse 2</label>
            <input id="opt-b" type="text" className={`${field} min-w-0 text-sm`} value={f.opt_b} onChange={(e) => upd({ opt_b: e.target.value })} />
          </div>
        </div>
      )}
      <p className={`m-0 mt-auto text-xs ${muted}`}>Garde un texte court : une story se lit en 5 secondes.</p>
    </div>
  );

  const strip = (
    <div className="flex flex-col gap-2.5 rounded-[18px] px-4 py-3.5" style={{ background: STRIP_BG, color: STRIP_FG }}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold">Ta séquence de stories</span>
        <div className="flex gap-1.5">
          <button type="button" disabled={i === 0} onClick={() => { const a = frames.slice(); [a[i - 1], a[i]] = [a[i], a[i - 1]]; setAll(a, i - 1); }} className={stripBtn} style={{ borderColor: "rgba(241,230,222,0.4)", color: STRIP_FG }} aria-label="Déplacer le visuel vers la gauche">← Déplacer</button>
          <button type="button" disabled={i >= n - 1} onClick={() => { const a = frames.slice(); [a[i + 1], a[i]] = [a[i], a[i + 1]]; setAll(a, i + 1); }} className={stripBtn} style={{ borderColor: "rgba(241,230,222,0.4)", color: STRIP_FG }} aria-label="Déplacer le visuel vers la droite">Déplacer →</button>
          <button type="button" disabled={n <= 1} onClick={() => setAll(frames.filter((_, k) => k !== i), Math.max(0, i - 1))} className={stripBtn} style={{ borderColor: "rgba(241,230,222,0.4)", color: STRIP_FG }}>Supprimer</button>
        </div>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {frames.map((x, k) => (
          <StoryThumb key={k} frame={x} n={k + 1} style={style} look={look} on={k === i} onClick={() => setSel(k)} stickerName={x.sticker === "none" ? "" : STICKER_NAME[x.sticker]} />
        ))}
        <button
          type="button"
          disabled={n >= MAX_FRAMES}
          onClick={() => { const a = frames.slice(); a.splice(i + 1, 0, { title: "Ton texte ici", sub: "", sticker: "none", sticker_text: "", opt_a: "", opt_b: "", bg: "color", photo_url: null, photo_label: "", tone: "light" }); setAll(a, i + 1); }}
          className="aspect-[9/16] w-16 flex-none rounded-[10px] bg-transparent text-xs disabled:opacity-40"
          style={{ border: "1.5px dashed rgba(241,230,222,0.5)", color: STRIP_FG }}
        >
          + Visuel
        </button>
      </div>
      <span className="text-[11px] opacity-80">Chaque visuel de la séquence utilise 1 crédit.</span>
    </div>
  );

  const stylePanel = (
    <div className={`${panel} gap-3`}>
      <div className="flex flex-col gap-0.5">
        <h2 className={h2}>1. Style des stories</h2>
        <span className={`text-[13px] ${muted}`}>Le même que tes carrousels, pour un compte cohérent.</span>
      </div>
      <div role="group" aria-label="Styles de story" className="grid grid-cols-2 gap-2">
        {STYLES.map((st) => {
          const on = st.id === style;
          const sw = styleSwatch(st.id, look);
          return (
            <button key={st.id} type="button" aria-pressed={on} onClick={() => setStyle(st.id)}
              className={`flex items-center gap-2.5 rounded-xl bg-[var(--ivoire)] p-2 text-left text-[var(--cacao)] ${on ? "border-2 border-[var(--cacao)]" : "border border-[var(--mocha-light)]"}`}>
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-[var(--mocha-light)]" style={{ ...titleCss(st.id, look, st.titleUppercase ? 18 : 22), background: sw.bg, color: sw.fg }}>{st.sample}</span>
              <span className="text-[13px] font-bold">{st.storyName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const stickerPanel = (
    <div className={`${panel} gap-3`}>
      <div className="flex flex-col gap-0.5">
        <h2 className={h2}>2. Élément interactif</h2>
        <span className={`text-[13px] ${muted}`}>{stickerDef.hint}</span>
      </div>
      <div role="group" aria-label="Éléments interactifs" className="grid grid-cols-3 gap-2">
        {STICKERS.map((k) => {
          const on = k.id === f.sticker;
          return (
            <button key={k.id} type="button" aria-pressed={on}
              onClick={() => upd({ sticker: k.id, sticker_text: f.sticker_text || k.defaultText, opt_a: f.opt_a || "Oui", opt_b: f.opt_b || "Non" })}
              className={`min-h-11 rounded-xl bg-[var(--ivoire)] px-1.5 py-1 text-xs font-bold text-[var(--cacao)] ${on ? "border-2 border-[var(--cacao)]" : "border border-[var(--mocha-light)]"}`}>
              {k.name}
            </button>
          );
        })}
      </div>
    </div>
  );

  const bgPanel = (
    <div className={`${panel} gap-2.5`}>
      <h2 className={h2}>3. Fond du visuel {i + 1}</h2>
      <label htmlFor="st-photo" className="flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[var(--cacao)] text-sm font-bold text-[var(--ivoire)]">Ajouter ma photo ou ma vidéo</label>
      <input id="st-photo" type="file" accept="image/*,video/*" onChange={onPhoto} className="text-xs" />
      <div className="flex gap-2">
        <button type="button" onClick={() => upd({ bg: "color", photo_url: null, tone: f.tone === "dark" ? "pink" : f.tone === "pink" ? "light" : "dark" })}
          className="min-h-11 flex-1 rounded-full border border-[var(--cacao)] bg-transparent text-[13px] text-[var(--cacao)]">Couleur de ma charte</button>
        <button type="button" disabled={!imageGeneration} aria-label={imageGeneration ? undefined : "Générer un visuel : bientôt disponible"}
          className="min-h-11 flex-1 rounded-full border border-[var(--mocha)]/40 bg-transparent text-[13px] text-[var(--cacao)] disabled:cursor-not-allowed disabled:opacity-50">
          {imageGeneration ? "Générer un visuel" : "Bientôt disponible"}
        </button>
      </div>
    </div>
  );

  const validateBlock = (
    <div className="flex flex-col gap-2.5">
      {programmed && (
        <span role="status" className="rounded-[14px] bg-[var(--sable)] px-4 py-3 text-center text-sm font-bold">
          Séquence validée, programmée {dayLabel(pub.scheduled_date).toLowerCase()} à {pub.scheduled_time}
        </span>
      )}
      {error && <p role="alert" className="m-0 text-center text-sm text-[var(--cacao)]">{error}</p>}
      <button type="button" onClick={validate} disabled={programmed || exporting}
        className={programmed
          ? "min-h-[52px] rounded-full border border-[var(--mocha)]/40 bg-[var(--sable)] text-[15px] font-bold text-[var(--mocha)]"
          : "min-h-[52px] rounded-full border-none bg-[var(--cacao)] text-[15px] font-bold text-[var(--ivoire)] disabled:opacity-60"}>
        {exporting ? "Export des images…" : `Valider et programmer (${n} crédit${n > 1 ? "s" : ""})`}
      </button>
      {programmed && (images.length > 0 || pub.export_urls.length > 0) && (
        <button type="button" onClick={() => (images.length ? downloadAll(images, slugify(pub.title)) : pub.export_urls.forEach((u) => window.open(u, "_blank")))}
          className="min-h-11 rounded-full border border-[var(--cacao)] bg-transparent text-sm text-[var(--cacao)]">
          Télécharger mes images
        </button>
      )}
      <span className={`text-center text-[13px] ${muted}`}>{n} visuel{n > 1 ? "s" : ""} dans cette séquence, soit {n} crédit{n > 1 ? "s" : ""}.</span>
      <span className={`text-center text-xs ${muted}`}>Les éléments interactifs sont exportés comme repères : recrée-les dans Instagram au moment de publier.</span>
      <SaveState state={saveState} />
    </div>
  );

  const shared = (
    <>
      <FontLoader custom={settings.custom_fonts} />
      <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
        {frames.map((x, k) => (
          <div key={k} ref={(el) => { exportRefs.current[k] = el; }} style={{ width: 270 }}>
            <StoryView frame={x} index={k} total={n} style={style} look={look} variant="export" />
          </div>
        ))}
      </div>
      {dialog}
    </>
  );

  if (isMobile) {
    const tabs = ["Textes", "1. Style", "2. Interactif", "3. Fond"];
    return (
      <div className="flex flex-col gap-3 px-4 pb-48 pt-4">
        {shared}
        {header}
        <div className="flex justify-center">{preview}</div>
        {strip}
        <div role="tablist" aria-label="Réglages" className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t, k) => (
            <button key={t} type="button" role="tab" aria-selected={k === mtab} onClick={() => setMtab(k)}
              className={`min-h-11 flex-none rounded-full px-3.5 text-[13px] font-bold ${k === mtab ? "bg-[var(--cacao)] text-[var(--ivoire)]" : "border border-[var(--mocha)]/40 text-[var(--cacao)]"}`}>
              {t}
            </button>
          ))}
        </div>
        <div role="tabpanel">{[texts, stylePanel, stickerPanel, bgPanel][mtab]}</div>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--mocha-light)] bg-[var(--ivoire)] px-4 py-3">{validateBlock}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-[22px] px-8 pb-16 pt-8">
      {shared}
      {header}
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_660px] flex-col gap-[18px]">
          <div className="flex flex-wrap items-stretch gap-5">
            {preview}
            {texts}
          </div>
          {strip}
        </div>
        <aside aria-label="Réglages de la story" className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          {stylePanel}
          {stickerPanel}
          {bgPanel}
          {validateBlock}
        </aside>
      </div>
    </div>
  );
}
