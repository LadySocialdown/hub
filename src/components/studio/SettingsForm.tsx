"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  BODY_FONTS,
  COLOR_NAMES,
  NETWORKS,
  POSTS_PER_WEEK,
  PREFERRED_TIMES,
  STYLES,
  STYLE_SETTINGS_DESC,
  TITLE_FONTS,
  fontStack,
} from "@/lib/studio/constants";
import type { StudioPillar, StudioSettings, StudioStyleId } from "@/types/studio";
import { FontLoader } from "./FontLoader";
import { btnDashed, btnPrimary, card, choice, field, label, muted, pill, uploadFile } from "./ui";

const fieldset = `${card} m-0 flex flex-col p-[22px]`;
const legend = "px-2 font-serif text-[28px] font-semibold text-[var(--cacao)]";

export function SettingsForm({ initial, isNew }: { initial: StudioSettings; isNew: boolean }) {
  const router = useRouter();
  const [s, setS] = useState<StudioSettings>(initial);
  const [editPillars, setEditPillars] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const set = <K extends keyof StudioSettings>(k: K, v: StudioSettings[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const customNames = s.custom_fonts.map((f) => f.name);
  const titleFonts = [...TITLE_FONTS, ...customNames];
  const bodyFonts = [...BODY_FONTS, ...customNames];
  const style = s.default_style === "ref" ? "doux" : s.default_style;
  const styleIdx = ["doux", "edito", "magazine", "minimal"].indexOf(style);
  const cols = s.colors;
  const ft = fontStack(s.font_title);
  const fb = fontStack(s.font_body);
  const tExtra: React.CSSProperties =
    styleIdx === 1 ? { fontStyle: "italic" } : styleIdx === 2 ? { textTransform: "uppercase", letterSpacing: "0.02em" } : {};
  const radius = [12, 3, 0, 8][styleIdx];
  const showLogo = !!s.logo_url && s.show_logo_on_cover;

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("logo");
    setError(null);
    try {
      const { url } = await uploadFile(f, "logo");
      set("logo_url", url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(null);
    }
  }

  async function onFonts(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading("font");
    setError(null);
    try {
      const added: { name: string; url: string }[] = [];
      for (const f of files) {
        const { url } = await uploadFile(f, "font");
        added.push({ name: f.name.replace(/\.(ttf|otf|woff2?)$/i, "").replace(/[-_]+/g, " ").trim(), url });
      }
      set("custom_fonts", [...s.custom_fonts.filter((c) => !added.some((a) => a.name === c.name)), ...added]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  function setPillar(i: number, patch: Partial<StudioPillar>) {
    set("pillars", s.pillars.map((p, k) => (k === i ? { ...p, ...patch } : p)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Enregistrement impossible.");
      setSaved(true);
      setEditPillars(false);
      if (isNew) router.push("/dashboard/studio");
      else router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-[22px] px-4 pb-16 pt-8 sm:px-8">
      <FontLoader custom={s.custom_fonts} />
      <div className="flex flex-col gap-1.5">
        {!isNew && (
          <Link href="/dashboard/studio" className="mb-1 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm text-[var(--cacao)] underline">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour au studio
          </Link>
        )}
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.05] text-[var(--cacao)] sm:text-[48px]">Mes réglages</h1>
        <p className={`m-0 max-w-[680px] text-[15px] ${muted}`}>
          Ils servent de base à ton cahier de bord et à tout ce que crée ton studio. Chaque modification se voit dans l&apos;aperçu à droite.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <form className="flex min-w-0 flex-[2_1_640px] flex-col gap-[18px]" onSubmit={(e) => e.preventDefault()}>
          <fieldset className={`${fieldset} gap-3.5`}>
            <legend className={legend}>1. Ton activité</legend>
            <div className="flex flex-wrap gap-3.5">
              <div className="flex flex-[1_1_260px] flex-col gap-1.5">
                <label htmlFor="rg-act" className={label}>Ce que tu vends</label>
                <input id="rg-act" type="text" className={field} value={s.activity} onChange={(e) => set("activity", e.target.value)} placeholder="Bouquets et compositions florales sur mesure, à Tours" />
              </div>
              <div className="flex flex-[1_1_260px] flex-col gap-1.5">
                <label htmlFor="rg-cible" className={label}>À qui tu t&apos;adresses</label>
                <input id="rg-cible" type="text" className={field} value={s.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Particuliers qui veulent offrir, et futurs mariés" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3.5">
              <div className="flex flex-[1_1_200px] flex-col gap-1.5">
                <label htmlFor="rg-pseudo" className={label}>Ton compte</label>
                <input id="rg-pseudo" type="text" className={field} value={s.handle} onChange={(e) => set("handle", e.target.value.replace(/^@/, ""))} placeholder="atelier.fleuri" />
              </div>
              <div className="flex flex-[1_1_200px] flex-col gap-1.5">
                <label htmlFor="rg-ton" className={label}>Ton ton en trois mots</label>
                <input id="rg-ton" type="text" className={field} value={s.tone} onChange={(e) => set("tone", e.target.value)} placeholder="Poétique, chaleureux, précis" />
              </div>
            </div>
          </fieldset>

          <fieldset className={`${fieldset} gap-4`}>
            <legend className={legend}>2. Ta charte</legend>

            <div className="flex flex-wrap items-center gap-4">
              <div className="box-border flex h-[88px] w-[88px] flex-none items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-[var(--mocha)]/40 bg-[var(--sable)] p-1.5">
                {s.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logo_url} alt="Ton logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-center text-xs text-[var(--mocha)]">Ton logo</span>
                )}
              </div>
              <div className="flex flex-[1_1_240px] flex-col gap-1.5">
                <label htmlFor="rg-logo" className={`${btnPrimary} cursor-pointer`}>
                  {uploading === "logo" ? "Envoi en cours…" : "Déposer mon logo"}
                </label>
                <input id="rg-logo" type="file" accept="image/*" onChange={onLogo} className="text-xs" />
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input type="checkbox" checked={s.show_logo_on_cover} onChange={() => set("show_logo_on_cover", !s.show_logo_on_cover)} />
                  Afficher mon logo sur la première slide de mes carrousels
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className={label}>Tes couleurs</span>
              <div className="flex flex-wrap gap-3.5">
                {COLOR_NAMES.map((c) => (
                  <label key={c.key} className="flex min-w-16 flex-col items-center gap-1 text-xs">
                    <input
                      type="color"
                      value={cols[c.key]}
                      onChange={(e) => set("colors", { ...cols, [c.key]: e.target.value.toUpperCase() })}
                      className="h-14 w-14 cursor-pointer rounded-xl border border-[var(--mocha-light)] bg-[var(--ivoire)] p-0.5"
                    />
                    <span className="font-bold">{c.name}</span>
                    <span className={muted}>{cols[c.key].toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3.5">
              <div className="flex flex-[1_1_240px] flex-col gap-1.5">
                <label htmlFor="rg-ft" className={label}>Police des titres</label>
                <select id="rg-ft" className={field} value={s.font_title} onChange={(e) => set("font_title", e.target.value)}>
                  {titleFonts.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <span style={{ fontFamily: ft, fontSize: 26, fontWeight: 600, lineHeight: 1.1 }}>Une table de fête</span>
              </div>
              <div className="flex flex-[1_1_240px] flex-col gap-1.5">
                <label htmlFor="rg-fb" className={label}>Police des textes</label>
                <select id="rg-fb" className={field} value={s.font_body} onChange={(e) => set("font_body", e.target.value)}>
                  {bodyFonts.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <span style={{ fontFamily: fb, fontSize: 14 }}>Pas besoin d&apos;un gros budget pour une belle table.</span>
              </div>
            </div>
            <label className={`${btnDashed} relative cursor-pointer text-[13px]`}>
              {uploading === "font" ? "Envoi en cours…" : "Importer mes propres polices (.ttf, .otf, .woff)"}
              <input type="file" accept=".ttf,.otf,.woff,.woff2" multiple onChange={onFonts} className="absolute h-px w-px opacity-0" />
            </label>

            <div className="flex flex-col gap-2">
              <span className={label}>Ton style par défaut</span>
              <div role="group" aria-label="Style par défaut" className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={style === st.id}
                    onClick={() => set("default_style", st.id as StudioStyleId)}
                    className={`flex flex-col items-start gap-0.5 rounded-[14px] p-3 text-left text-[var(--cacao)] ${choice(style === st.id)}`}
                  >
                    <span className="text-sm font-bold">{st.name}</span>
                    <span className={`text-xs ${muted}`}>{STYLE_SETTINGS_DESC[st.id]}</span>
                  </button>
                ))}
              </div>
              <span className={`text-xs ${muted}`}>Il s&apos;applique à chaque nouveau contenu. Tu peux toujours en changer dans le studio.</span>
            </div>
          </fieldset>

          <fieldset className={`${fieldset} gap-3`}>
            <legend className={legend}>3. Tes piliers</legend>
            {s.pillars.map((p, i) =>
              editPillars ? (
                <div key={i} className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-[var(--sable)] px-3 py-2.5">
                  <label className="sr-only" htmlFor={`pl-c-${i}`}>Couleur du pilier {i + 1}</label>
                  <input id={`pl-c-${i}`} type="color" value={p.color} onChange={(e) => setPillar(i, { color: e.target.value.toUpperCase() })} className="h-11 w-11 flex-none cursor-pointer rounded-lg border border-[var(--mocha-light)] bg-[var(--ivoire)] p-0.5" />
                  <label className="sr-only" htmlFor={`pl-n-${i}`}>Nom du pilier {i + 1}</label>
                  <input id={`pl-n-${i}`} className={`${field} flex-[1_1_140px] font-bold`} value={p.name} onChange={(e) => setPillar(i, { name: e.target.value })} />
                  <label className="sr-only" htmlFor={`pl-d-${i}`}>Description du pilier {i + 1}</label>
                  <input id={`pl-d-${i}`} className={`${field} flex-[2_1_220px] text-[13px]`} value={p.description} onChange={(e) => setPillar(i, { description: e.target.value })} />
                  <button
                    type="button"
                    aria-label={`Supprimer le pilier ${p.name}`}
                    disabled={s.pillars.length <= 3}
                    onClick={() => set("pillars", s.pillars.filter((_, k) => k !== i))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--cacao)] disabled:opacity-30"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div key={i} className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-[var(--sable)] px-3 py-2.5">
                  <span aria-hidden="true" className="h-3.5 w-3.5 flex-none rounded-full" style={{ background: p.color }} />
                  <span className="flex-[1_1_140px] font-bold">{p.name}</span>
                  <span className={`flex-[2_1_220px] text-[13px] ${muted}`}>{p.description}</span>
                </div>
              ),
            )}
            {editPillars ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={s.pillars.length >= 5}
                  onClick={() => set("pillars", [...s.pillars, { name: "Nouveau pilier", description: "", color: "#A47864" }])}
                  className={`${btnDashed} disabled:opacity-40`}
                >
                  <Plus size={16} aria-hidden="true" />
                  Ajouter un pilier
                </button>
                <button type="button" onClick={() => setEditPillars(false)} className={btnDashed}>Terminer</button>
                <span className={`self-center text-xs ${muted}`}>Entre 3 et 5 piliers.</span>
              </div>
            ) : (
              <button type="button" onClick={() => setEditPillars(true)} className={`${btnDashed} self-start`}>Modifier mes piliers</button>
            )}
          </fieldset>

          <fieldset className={`${fieldset} gap-3`}>
            <legend className={legend}>4. Ton rythme et tes réseaux</legend>
            <div className="flex flex-wrap gap-2">
              {NETWORKS.map((n) => {
                const on = s.networks.includes(n);
                return (
                  <button key={n} type="button" aria-pressed={on} className={pill(on)}
                    onClick={() => set("networks", on ? s.networks.filter((x) => x !== n) : [...s.networks, n])}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3.5">
              <div className="flex flex-[1_1_220px] flex-col gap-1.5">
                <label htmlFor="rg-rythme" className={label}>Publications par semaine</label>
                <select id="rg-rythme" className={field} value={s.posts_per_week} onChange={(e) => set("posts_per_week", Number(e.target.value))}>
                  {POSTS_PER_WEEK.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-[1_1_220px] flex-col gap-1.5">
                <label htmlFor="rg-heure" className={label}>Heure de publication préférée</label>
                <select id="rg-heure" className={field} value={s.preferred_time} onChange={(e) => set("preferred_time", e.target.value)}>
                  {PREFERRED_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
        </form>

        <aside aria-label="Aperçu de ta charte" className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5 lg:sticky lg:top-5">
          <div className={`${card} flex flex-col items-center gap-3.5 p-5`}>
            <span className="self-start font-serif text-[26px] font-semibold text-[var(--cacao)]">Aperçu</span>
            <div className="flex items-end gap-3.5">
              <div
                className="box-border flex aspect-[4/5] w-[170px] flex-col gap-1.5 overflow-hidden p-3.5"
                style={{
                  boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                  borderRadius: radius,
                  background: styleIdx === 3 ? "#FFFFFF" : cols.principale,
                  color: styleIdx === 3 ? cols.principale : cols.fond,
                  borderTop: styleIdx === 1 ? `1px solid ${cols.accent}` : undefined,
                }}
              >
                {showLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logo_url!} alt="" className="h-[34px] w-[34px] rounded-md object-contain" style={{ background: "rgba(255,255,255,0.85)" }} />
                )}
                <span style={{ fontFamily: fb, fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: styleIdx === 3 ? cols.detail : cols.accent }}>Réveillon</span>
                <span style={{ fontFamily: ft, fontSize: styleIdx === 2 ? 16 : 20, fontWeight: 600, lineHeight: 1.05, ...tExtra }}>Une table de fête avec 3 tiges</span>
                <span style={{ fontFamily: fb, fontSize: 10, opacity: 0.9 }}>Pas besoin d&apos;un gros budget.</span>
                <span className="mt-auto" style={{ fontSize: 9, letterSpacing: "0.06em", opacity: 0.75 }}>@{s.handle || "ton.compte"}</span>
              </div>
              <div
                className="box-border flex aspect-[9/16] w-[110px] flex-col justify-center gap-1.5 rounded-xl px-2.5 py-3"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.14)", background: cols.accent, color: cols.principale }}
              >
                <span style={{ fontFamily: ft, fontSize: 16, fontWeight: 600, lineHeight: 1.05, textAlign: "center", ...tExtra }}>Tu préfères ?</span>
                <span className="rounded-lg p-[5px] text-center text-[9px] font-bold" style={{ background: "#FFFFFF", color: "#262626" }}>Couronne classique</span>
                <span className="rounded-lg p-[5px] text-center text-[9px] font-bold" style={{ background: "#FFFFFF", color: "#262626" }}>Couronne bohème</span>
              </div>
            </div>
            <span className={`text-center text-xs ${muted}`}>Un carrousel et une story créés avec tes réglages.</span>
          </div>
          {error && <p role="alert" className="m-0 text-sm text-[var(--cacao)]">{error}</p>}
          <button type="button" onClick={save} disabled={saving} className={`${btnPrimary} min-h-[52px] text-[15px]`}>
            {saving ? "Enregistrement…" : saved ? "Réglages enregistrés" : "Enregistrer mes réglages"}
          </button>
        </aside>
      </div>
    </div>
  );
}
