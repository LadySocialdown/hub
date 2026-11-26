"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { DAY_SHORT, DAY_NAMES, FORMAT_LABEL, MONTH_NAMES, OBJECTIVES, PLANNING_LANES, parseDate } from "@/lib/studio/constants";
import { pillarColor, STATUS_STYLE } from "@/lib/studio/theme";
import type { CreditBalance, StudioFormat, StudioPublication, StudioSettings } from "@/types/studio";
import { CreditsDialog } from "../CreditsDialog";
import { FontLoader } from "../FontLoader";
import { useIsMobile } from "../editor/common";
import { card, field, label, muted, smallTitle } from "../ui";
import { PubThumb } from "./PubThumb";

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(isoDate: string, n: number) {
  const d = parseDate(isoDate);
  d.setDate(d.getDate() + n);
  return iso(d);
}

const btnFill = "min-h-12 rounded-full border-none bg-[var(--cacao)] px-[22px] text-sm font-bold text-[var(--ivoire)] disabled:opacity-60";
const btnDone = "min-h-12 rounded-full border border-[var(--mocha)]/40 bg-[var(--sable)] px-[22px] text-sm font-bold text-[var(--cacao)]";
const btnOutline = "min-h-12 rounded-full border border-[var(--cacao)] bg-transparent px-[22px] text-sm font-bold text-[var(--cacao)]";

export function Planning({
  weekStart, initialPubs, settings, balance: initialBalance, openNew,
}: {
  weekStart: string;
  initialPubs: StudioPublication[];
  settings: StudioSettings;
  balance: CreditBalance;
  openNew: StudioFormat | null;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [pubs, setPubs] = useState(initialPubs);
  const [balance, setBalance] = useState(initialBalance);
  const [sel, setSel] = useState<string | null>(null);
  const [recap, setRecap] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appeared, setAppeared] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<string | null>(null);
  const [newForm, setNewForm] = useState<StudioFormat | null>(openNew);
  const [mday, setMday] = useState(() => {
    const today = iso(new Date());
    const k = Array.from({ length: 7 }, (_, j) => addDays(weekStart, j)).indexOf(today);
    return k >= 0 ? k : 0;
  });


  const days = Array.from({ length: 7 }, (_, k) => addDays(weekStart, k));
  const start = parseDate(weekStart);
  const toCreate = pubs.filter((p) => p.status === "a_creer" && p.format !== "reel");
  const reels = pubs.filter((p) => p.format === "reel");
  const ready = pubs.length - toCreate.length;
  const done = pubs.length > 0 && toCreate.length === 0;
  const nothingCreated = pubs.length > 0 && toCreate.length === pubs.filter((p) => p.format !== "reel").length && toCreate.length > 0;
  const selPub = pubs.find((p) => p.id === sel) ?? null;

  async function launch() {
    if (balance.total < toCreate.length) {
      setRecap(false);
      setCredits(toCreate[0]?.title ?? "ta semaine");
      return;
    }
    setRecap(false);
    setBusy(true);
    setError(null);
    for (const p of toCreate) {
      try {
        const res = await fetch("/api/studio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, frames: 1 }) });
        const json = await res.json();
        if (res.status === 402) {
          setCredits(p.title);
          break;
        }
        if (!res.ok) {
          setError(`« ${p.title} » n'a pas pu être créé : ${json.error ?? "réessaie dans un instant."}`);
          continue;
        }
        setPubs((a) => a.map((x) => (x.id === p.id ? json.publication : x)));
        setAppeared((a) => [...a, p.id]);
        if (json.balance) setBalance(json.balance);
      } catch {
        setError("La création a été interrompue. Vérifie ta connexion et relance.");
        break;
      }
    }
    setBusy(false);
    router.refresh();
  }

  const counterText = `${ready} sur ${pubs.length} contenus prêts · ${balance.monthlyUsed} crédits utilisés sur ${balance.monthlyIncluded}`;
  const counter = (
    <span className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${done ? "bg-[var(--cacao)] text-[var(--ivoire)]" : "border border-[var(--mocha-light)] bg-white text-[var(--cacao)]"}`}>{counterText}</span>
  );
  const actions = (
    <>
      <button type="button" onClick={() => setNewForm("carrousel")} className={btnOutline}>Créer un contenu spontané</button>
      <button type="button" disabled={busy || done || !toCreate.length} onClick={() => setRecap(true)} className={done ? btnDone : btnFill}>
        {done ? "Semaine prête à relire" : busy ? "Création en cours…" : "Créer ma semaine"}
      </button>
    </>
  );

  const weekNav = (
    <div className="flex items-center gap-1.5">
      <Link href={`/dashboard/studio?semaine=${addDays(weekStart, -7)}`} aria-label="Semaine précédente" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)]">
        <ChevronLeft size={18} aria-hidden="true" />
      </Link>
      <Link href={`/dashboard/studio?semaine=${addDays(weekStart, 7)}`} aria-label="Semaine suivante" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)]">
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
      <Link href="/dashboard/studio/reglages" aria-label="Mes réglages" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)]">
        <Settings size={18} aria-hidden="true" />
      </Link>
    </div>
  );

  const recapStats = (big: number) => (
    <div className="flex flex-wrap gap-3.5">
      {[
        { n: String(toCreate.length), t: `contenus créés maintenant${toCreate.some((p) => p.source === "declinaison") ? `, dont ${toCreate.filter((p) => p.source === "declinaison").length} déclinés de ton Reel` : ""}` },
        { n: `${toCreate.length} crédit${toCreate.length > 1 ? "s" : ""}`, t: "utilisés maintenant" },
        ...(reels.length ? [{ n: `${reels.length} Reel${reels.length > 1 ? "s" : ""}`, t: "en attente de tes vidéos. Son crédit sera utilisé au montage." }] : []),
      ].map((x) => (
        <div key={x.t} className="flex flex-[1_1_200px] flex-col gap-0.5 rounded-[14px] bg-[var(--sable)] p-4">
          <span className="font-serif font-bold leading-none" style={{ fontSize: big }}>{x.n}</span>
          <span className="text-sm">{x.t}</span>
        </div>
      ))}
      <div className="flex flex-[1_1_200px] flex-col gap-0.5 rounded-[14px] bg-[var(--cacao)] p-4 text-[var(--ivoire)]">
        <span className="font-serif font-bold leading-none" style={{ fontSize: big }}>{Math.max(0, balance.total - toCreate.length)}</span>
        <span className="text-sm">crédits restants sur {balance.monthlyIncluded} ensuite</span>
      </div>
    </div>
  );
  const recapBody = (big: number) => (
    <>
      <h2 className="m-0 font-serif text-[32px] font-semibold text-[var(--cacao)]">Avant de lancer ta semaine</h2>
      {recapStats(big)}
      <p className={`m-0 text-sm ${muted}`}>Chaque contenu passera en « À relire ». Rien n&apos;est validé ni programmé sans ton accord.</p>
      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" onClick={() => setRecap(false)} className="min-h-11 rounded-full border border-[var(--cacao)] bg-transparent px-[18px] text-sm text-[var(--cacao)]">Annuler</button>
        <button type="button" onClick={launch} className="min-h-11 rounded-full border-none bg-[var(--cacao)] px-[22px] text-sm font-bold text-[var(--ivoire)]">Lancer la création</button>
      </div>
    </>
  );

  const laneTime = (format: StudioFormat) => {
    const times = Array.from(new Set(pubs.filter((p) => p.format === format).map((p) => p.scheduled_time)));
    return times.length ? times.join(" ou ") : settings.preferred_time;
  };

  const sheet = selPub && (
    <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mocha)]">
        {DAY_NAMES[parseDate(selPub.scheduled_date).getDay()]} {parseDate(selPub.scheduled_date).getDate()} {MONTH_NAMES[parseDate(selPub.scheduled_date).getMonth()]} · {selPub.scheduled_time} · {FORMAT_LABEL[selPub.format]}
      </span>
      <span className="font-serif text-[30px] font-semibold leading-[1.1] text-[var(--cacao)]">{selPub.title}</span>
      <div className="flex flex-wrap gap-1.5">
        {(() => {
          const c = pillarColor(Math.max(0, settings.pillars.findIndex((p) => p.name === selPub.pillar)));
          return <span className="rounded-full px-2.5 py-[3px] text-xs font-bold" style={{ background: c.bg, color: c.fg }}>{selPub.pillar}</span>;
        })()}
        <span className="rounded-full border border-[var(--mocha)]/40 px-2.5 py-[3px] text-xs font-bold">Objectif : {selPub.objective}</span>
        <span className="rounded-full border border-[var(--mocha)]/40 px-2.5 py-[3px] text-xs font-bold">
          {selPub.format === "reel" ? "En attente de tes vidéos" : STATUS_STYLE[selPub.status].label}
        </span>
      </div>
    </div>
  );
  const sheetAction = selPub && selPub.format !== "reel" && (
    <Link href={`/dashboard/studio/${selPub.format}/${selPub.id}`} className="rounded-full bg-[var(--cacao)] px-5 py-3 text-sm font-bold text-[var(--ivoire)] no-underline">
      {selPub.status === "a_creer" ? "Créer ce contenu" : "Ouvrir et relire"}
    </Link>
  );

  const emptyCard = (nothingCreated || pubs.length === 0) && !busy && (
    <section aria-label="Semaine pas encore créée" className={`${card} flex flex-col items-start gap-3 rounded-[22px] p-7`}>
      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mocha)]">Studio de création</span>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, k) => <span key={k} className="h-11 w-[34px] rounded-lg border-[1.5px] border-dashed border-[var(--mocha)]/40" />)}
      </div>
      {pubs.length ? (
        <>
          <h2 className="m-0 font-serif text-[30px] font-semibold leading-[1.1] text-[var(--cacao)]">Ta semaine est briefée, rien n&apos;est encore créé</h2>
          <p className={`m-0 text-sm ${muted}`}>Tes {toCreate.length} publications attendent dans ton planning. Crée-les une par une, ou toute la semaine d&apos;un coup.</p>
        </>
      ) : (
        <>
          <h2 className="m-0 font-serif text-[30px] font-semibold leading-[1.1] text-[var(--cacao)]">Rien n&apos;est encore prévu cette semaine</h2>
          <p className={`m-0 text-sm ${muted}`}>Ajoute un contenu spontané : choisis son format, son jour et son objectif, le studio le crée à ta charte.</p>
          <button type="button" onClick={() => setNewForm("carrousel")} className="mt-auto rounded-full bg-[var(--cacao)] px-5 py-3.5 text-sm font-bold text-[var(--ivoire)]">Créer un contenu spontané</button>
        </>
      )}
    </section>
  );

  const creditsRow = (
    <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
      <section aria-label="Crédits du mois" className={`${card} flex flex-col items-start gap-3 rounded-[22px] p-7`}>
        <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mocha)]">Crédits du mois</span>
        <span className="font-serif text-[46px] font-bold leading-none text-[var(--cacao)]">{balance.monthly}</span>
        <p className={`m-0 text-sm ${muted}`}>crédits restants sur {balance.monthlyIncluded} ce mois-ci. Ils se renouvellent le 1er de chaque mois.</p>
      </section>
      {balance.pack === 0 ? (
        <section aria-label="Aucun pack de crédits" className={`${card} flex flex-col items-start gap-3 rounded-[22px] p-7`}>
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mocha)]">Mon abonnement</span>
          <span className="font-serif text-[46px] font-bold leading-none text-[var(--cacao)]">0</span>
          <h2 className="m-0 font-serif text-[30px] font-semibold leading-[1.1] text-[var(--cacao)]">Aucun crédit de pack pour l&apos;instant</h2>
          <p className={`m-0 text-sm ${muted}`}>Tes 20 crédits du mois suffisent pour 5 contenus par semaine. Un pack sert pour un lancement ou un mois chargé.</p>
          <button type="button" onClick={() => setCredits("ton prochain contenu")} className="mt-auto rounded-full border border-[var(--cacao)] bg-transparent px-5 py-3.5 text-sm text-[var(--cacao)]">Voir les packs</button>
        </section>
      ) : (
        <section aria-label="Crédits de pack" className={`${card} flex flex-col items-start gap-3 rounded-[22px] p-7`}>
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mocha)]">Mon abonnement</span>
          <span className="font-serif text-[46px] font-bold leading-none text-[var(--cacao)]">{balance.pack}</span>
          <p className={`m-0 text-sm ${muted}`}>
            crédits de pack, utilisés après ceux du mois.
            {balance.packExpiries[0] && ` Les premiers expirent le ${new Date(balance.packExpiries[0].expires_at).toLocaleDateString("fr-FR")}.`}
          </p>
        </section>
      )}
    </div>
  );

  const dialogs = (
    <>
      <style>{`@keyframes studioAppear{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}.studio-appear{animation:studioAppear .45s ease both}`}</style>
      <FontLoader custom={settings.custom_fonts} />
      {credits && <CreditsDialog title={credits} remainingPlanned={toCreate.length} onClose={() => setCredits(null)} />}
      {newForm && <NewContentDialog format={newForm} settings={settings} weekStart={weekStart} onClose={() => { setNewForm(null); if (openNew) router.replace("/dashboard/studio"); }} />}
    </>
  );

  const h1 = `Semaine du ${start.getDate()} ${MONTH_NAMES[start.getMonth()]}`;

  if (isMobile) {
    const dayPubs = (k: number) => pubs.filter((p) => p.scheduled_date === days[k]);
    return (
      <div className="flex flex-col pb-24">
        {dialogs}
        <div className="flex items-end justify-between gap-2 px-5 pb-2 pt-5">
          <div className="flex flex-col">
            <span className={`${smallTitle} tracking-[0.12em]`}>Studio</span>
            <span className="font-serif text-[32px] font-semibold leading-[1.05] text-[var(--cacao)]">{h1}</span>
          </div>
        </div>
        <div className="px-4 pb-2">{weekNav}</div>
        <div className="flex flex-col items-stretch gap-2 px-4 pb-2.5">
          {counter}
          <button type="button" disabled={busy || done || !toCreate.length} onClick={() => setRecap(true)} className={done ? btnDone : btnFill}>
            {done ? "Semaine prête à relire" : busy ? "Création en cours…" : "Créer ma semaine"}
          </button>
        </div>
        {error && <p role="alert" className="mx-4 my-0 text-sm">{error}</p>}
        <div role="tablist" aria-label="Jours" className="flex gap-1.5 overflow-x-auto px-3 pb-2.5">
          {days.map((d, k) => {
            const on = k === mday;
            const c = dayPubs(k).length;
            return (
              <button key={d} type="button" role="tab" aria-selected={on} onClick={() => setMday(k)}
                className={`flex min-h-16 min-w-[52px] flex-none flex-col items-center justify-center rounded-[14px] px-2 ${on ? "bg-[var(--cacao)] text-[var(--ivoire)]" : "border border-[var(--mocha-light)] bg-[var(--ivoire)] text-[var(--cacao)]"}`}>
                <span className="text-[10px] font-bold uppercase">{DAY_SHORT[parseDate(d).getDay()]}</span>
                <span className="font-serif text-xl font-bold leading-none">{parseDate(d).getDate()}</span>
                <span className="text-[10px]">{c ? `${c} contenu${c > 1 ? "s" : ""}` : "—"}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 rounded-t-[22px] bg-[var(--sable)] px-4 pb-6 pt-1">
          {PLANNING_LANES.map((lane) => {
            const cell = dayPubs(mday).filter((x) => x.format === lane.format);
            return (
              <div key={lane.format} className="flex flex-col gap-1.5 pt-2.5">
                <span className="text-xs font-bold">{lane.name} <span className={`font-normal ${muted}`}>· {laneTime(lane.format)}</span></span>
                {cell.length ? (
                  <div className="flex flex-wrap gap-2">{cell.map((p) => <div key={p.id} className="flex w-[150px]"><PubThumb pub={p} look={settings} on={p.id === sel} onClick={() => setSel(p.id)} appear={appeared.includes(p.id)} /></div>)}</div>
                ) : (
                  <span className="text-[13px] text-[var(--mocha)]">Rien de prévu</span>
                )}
              </div>
            );
          })}
          {emptyCard}
          {creditsRow}
        </div>
        {recap && (
          <>
            <div className="fixed inset-0 z-[55]" style={{ background: "rgba(43,36,34,0.35)" }} aria-hidden="true" onClick={() => setRecap(false)} />
            <section role="dialog" aria-label="Récapitulatif avant création" className="fixed inset-x-0 bottom-0 z-[56] flex max-h-[85vh] flex-col gap-4 overflow-y-auto rounded-t-3xl bg-[var(--ivoire)] p-5">
              {recapBody(28)}
            </section>
          </>
        )}
        {selPub && (
          <>
            <div className="fixed inset-0 z-[55]" style={{ background: "rgba(43,36,34,0.35)" }} aria-hidden="true" onClick={() => setSel(null)} />
            <section role="dialog" aria-label="Détail du contenu" className="fixed inset-x-0 bottom-0 z-[56] flex flex-col gap-3.5 rounded-t-3xl bg-[var(--ivoire)] p-[18px]" style={{ boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
              <button type="button" onClick={() => setSel(null)} className="min-h-10 self-end rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] px-3.5 text-[13px] text-[var(--cacao)]">Fermer</button>
              {sheet}
              <div className="flex flex-wrap gap-2.5">{sheetAction}</div>
            </section>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-8 pb-16 pt-9">
      {dialogs}
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-[1_1_480px] flex-col gap-1.5">
          <div className={`${smallTitle} tracking-[0.12em]`}>Studio de création</div>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="m-0 font-serif text-[50px] font-semibold leading-[1.05] text-[var(--cacao)]">{h1}</h1>
            {weekNav}
          </div>
          <p className={`m-0 max-w-[640px] text-[15px] ${muted}`}>
            Ton planning se remplit avec tes contenus, à ta charte.
            {pubs.some((p) => p.source === "declinaison") && " Un seul tournage, ton Reel, est décliné en carrousel et en stories."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          {counter}
          {actions}
        </div>
      </section>
      {error && <p role="alert" className="m-0 text-sm">{error}</p>}

      {recap && (
        <section role="dialog" aria-label="Récapitulatif avant création" className="flex flex-col gap-4 rounded-[20px] border-2 border-[var(--cacao)] bg-[var(--ivoire)] p-6">
          {recapBody(38)}
        </section>
      )}

      {emptyCard}

      <section aria-label="Planning visuel" className="overflow-x-auto rounded-[22px] border border-[var(--mocha-light)] bg-[var(--ivoire)] p-[18px]">
        <div className="grid min-w-[1060px] gap-2.5" style={{ gridTemplateColumns: "120px repeat(7, minmax(0, 1fr))" }}>
          <span />
          {days.map((d) => (
            <div key={d} className="flex flex-col px-1.5 py-1">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--mocha)]">{DAY_SHORT[parseDate(d).getDay()]}</span>
              <span className="font-serif text-[22px] font-bold leading-none text-[var(--cacao)]">{parseDate(d).getDate()}</span>
            </div>
          ))}
          {PLANNING_LANES.map((lane) => (
            <LaneRow key={lane.format} name={lane.name} time={laneTime(lane.format)}>
              {days.map((d) => {
                const cell = pubs.filter((x) => x.scheduled_date === d && x.format === lane.format);
                return (
                  <div key={d} className="flex min-h-[190px] flex-col gap-2">
                    {cell.length ? (
                      cell.map((p) => <PubThumb key={p.id} pub={p} look={settings} on={p.id === sel} onClick={() => setSel(p.id)} appear={appeared.includes(p.id)} />)
                    ) : (
                      <div className="flex-1 rounded-[14px] bg-[var(--sable)]" />
                    )}
                  </div>
                );
              })}
            </LaneRow>
          ))}
        </div>
      </section>

      {selPub && (
        <section className={`${card} flex flex-wrap items-center gap-5 rounded-[20px] px-6 py-[22px]`}>
          {sheet}
          <div className="flex flex-wrap gap-2.5">{sheetAction}</div>
        </section>
      )}

      {creditsRow}
    </div>
  );
}

function LaneRow({ name, time, children }: { name: string; time: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col justify-center gap-0.5 p-1.5">
        <span className="text-sm font-bold">{name}</span>
        <span className={`text-xs ${muted}`}>{time}</span>
      </div>
      {children}
    </>
  );
}

/** Formulaire « Créer un contenu spontané » (temporaire, en attendant le cahier de bord). */
function NewContentDialog({ format: initial, settings, weekStart, onClose }: { format: StudioFormat; settings: StudioSettings; weekStart: string; onClose: () => void }) {
  const router = useRouter();
  const today = iso(new Date());
  const [format, setFormat] = useState<StudioFormat>(initial);
  const [date, setDate] = useState(weekStart > today ? weekStart : today);
  const [time, setTime] = useState(settings.preferred_time);
  const [pillar, setPillar] = useState(settings.pillars[0]?.name ?? "");
  const [objective, setObjective] = useState<string>(OBJECTIVES[0]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, date, time, pillar, objective, title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      router.push(`/dashboard/studio/${json.format}/${json.id}`);
    } catch (err) {
      setError((err as Error).message || "Création impossible.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" style={{ background: "rgba(43,36,34,0.35)" }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-label="Créer un contenu spontané"
        className="flex max-h-full w-full max-w-[560px] flex-col gap-3.5 overflow-auto rounded-t-3xl bg-[var(--ivoire)] p-6 sm:rounded-[28px]" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h2 className="m-0 font-serif text-[32px] font-semibold text-[var(--cacao)]">Créer un contenu spontané</h2>
        <div role="group" aria-label="Format" className="flex gap-2">
          {(["carrousel", "story"] as StudioFormat[]).map((f) => (
            <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)}
              className={`min-h-11 flex-1 rounded-full text-sm font-bold ${format === f ? "bg-[var(--cacao)] text-[var(--ivoire)]" : "border border-[var(--mocha)]/40 text-[var(--cacao)]"}`}>
              {FORMAT_LABEL[f]}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nc-title" className={label}>Titre</label>
          <input id="nc-title" required className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Une table de fête avec seulement 3 tiges" />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-[1_1_180px] flex-col gap-1.5">
            <label htmlFor="nc-date" className={label}>Date</label>
            <input id="nc-date" type="date" required className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-[1_1_120px] flex-col gap-1.5">
            <label htmlFor="nc-time" className={label}>Heure</label>
            <input id="nc-time" type="time" required className={field} value={time.padStart(5, "0")} onChange={(e) => setTime(e.target.value.replace(/^0(\d):/, "$1:"))} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-[1_1_180px] flex-col gap-1.5">
            <label htmlFor="nc-pillar" className={label}>Pilier</label>
            <select id="nc-pillar" className={field} value={pillar} onChange={(e) => setPillar(e.target.value)}>
              {settings.pillars.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-[1_1_180px] flex-col gap-1.5">
            <label htmlFor="nc-obj" className={label}>Objectif</label>
            <select id="nc-obj" className={field} value={objective} onChange={(e) => setObjective(e.target.value)}>
              {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        {error && <p role="alert" className="m-0 text-sm">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2.5">
          <button type="button" onClick={onClose} className="min-h-11 rounded-full border border-[var(--cacao)] bg-transparent px-[18px] text-sm text-[var(--cacao)]">Annuler</button>
          <button type="submit" disabled={busy} className="min-h-11 rounded-full border-none bg-[var(--cacao)] px-[22px] text-sm font-bold text-[var(--ivoire)] disabled:opacity-60">
            {busy ? "Création…" : "Continuer"}
          </button>
        </div>
      </form>
    </div>
  );
}
