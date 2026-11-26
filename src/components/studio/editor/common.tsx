"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DAY_NAMES, DAY_SHORT, MONTH_NAMES, OBJECTIVES, kpiFor, parseDate } from "@/lib/studio/constants";
import { pillarColor } from "@/lib/studio/theme";
import type { StudioPublication, StudioSettings } from "@/types/studio";
import { muted, smallTitle } from "../ui";

export function dayLabel(iso: string, short = false) {
  const d = parseDate(iso);
  return `${(short ? DAY_SHORT : DAY_NAMES)[d.getDay()]} ${d.getDate()}`;
}

export function monthName(iso: string) {
  return MONTH_NAMES[parseDate(iso).getMonth()];
}

/** Coupe un titre en deux : la seconde moitié s'affiche en italique (comme les maquettes). */
const SPLIT_WORDS = ["avec", "se", "pour", "selon", "sans", "qui", "en", "à", "au", "aux", "dans", "sur", "quand", "comme", "chez"];

export function splitTitle(title: string): [string, string] {
  const words = title.split(" ");
  if (words.length < 4) return [title, ""];
  let cut = words.findIndex((w, k) => k >= 2 && SPLIT_WORDS.includes(w.toLowerCase()));
  if (cut < 0) cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function PillarChip({ pub, settings }: { pub: StudioPublication; settings: StudioSettings }) {
  const idx = Math.max(0, settings.pillars.findIndex((p) => p.name === pub.pillar));
  const c = pillarColor(idx);
  return (
    <span className="rounded-full px-2.5 py-[3px] text-xs font-bold" style={{ background: c.bg, color: c.fg }}>
      {pub.pillar}
    </span>
  );
}

const chip = "rounded-full border border-[var(--mocha)]/40 px-2.5 py-[3px] text-xs font-bold text-[var(--cacao)]";

export function ObjectiveSelect({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mocha)]/40 py-0 pl-2.5 pr-1 text-xs font-bold text-[var(--cacao)]">
      Objectif :
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[30px] cursor-pointer border-none bg-transparent text-xs font-bold text-[var(--cacao)] focus:outline-none">
        {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function KpiChip({ format, objective }: { format: string; objective: string }) {
  return <span className={chip}>À suivre : {kpiFor(format, objective)}</span>;
}

export function StaticObjectiveChip({ objective }: { objective: string }) {
  return <span className={chip}>Objectif : {objective}</span>;
}

export function ObjectiveAlert({
  pub, objective, count, onReset, onAdapt, adapting, adapted,
}: { pub: StudioPublication; objective: string; count: number; onReset: () => void; onAdapt: () => void; adapting: boolean; adapted: boolean }) {
  return (
    <div role="status" className="mt-1.5 flex max-w-[760px] flex-wrap items-center gap-2.5 rounded-[14px] border border-[var(--mocha)] bg-[var(--sable)] px-3.5 py-3 text-[13px] text-[var(--noir)]">
      <span className="flex-[1_1_360px]">
        Ton plan de {monthName(pub.scheduled_date)} prévoit {count} contenus « {objective} » et tu en as déjà {count}. Celui-ci en ajoute un : ton cahier de bord sera mis à jour, et l’accroche comme l’appel à l’action seront adaptés à ce nouvel objectif.
      </span>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onAdapt} disabled={adapting || adapted} className="min-h-9 rounded-full bg-[var(--cacao)] px-3 text-xs font-bold text-[var(--ivoire)] disabled:opacity-60">
          {adapted ? "Accroche et appel à l’action adaptés" : adapting ? "Adaptation…" : "Adapter l’accroche et l’appel à l’action"}
        </button>
        <button type="button" onClick={onReset} className="min-h-9 rounded-full border border-[var(--cacao)] bg-transparent px-3 text-xs text-[var(--cacao)]">
          Revenir à l&apos;objectif prévu
        </button>
      </div>
    </div>
  );
}

export function ViewToggle({ view, setView }: { view: "editor" | "insta"; setView: (v: "editor" | "insta") => void }) {
  const btn = (on: boolean) =>
    `min-h-10 rounded-full border-none px-4 text-[13px] font-bold ${on ? "bg-[var(--cacao)] text-[var(--ivoire)]" : "bg-transparent text-[var(--cacao)]"}`;
  return (
    <div role="group" aria-label="Mode d'aperçu" className="flex gap-1 rounded-full bg-[var(--sable)] p-1">
      <button type="button" aria-pressed={view === "editor"} onClick={() => setView("editor")} className={btn(view === "editor")}>Vue éditeur</button>
      <button type="button" aria-pressed={view === "insta"} onClick={() => setView("insta")} className={btn(view === "insta")}>Vue Instagram</button>
    </div>
  );
}

export function EditorTitle({ kind, pub, children }: { kind: string; pub: StudioPublication; children?: React.ReactNode }) {
  const [a, b] = splitTitle(pub.title);
  return (
    <div className="flex flex-col gap-1.5">
      <Link href="/dashboard/studio" className={`${smallTitle} w-fit hover:underline`}>
        {kind} · {dayLabel(pub.scheduled_date)} · {pub.scheduled_time} · {pub.platforms[0] ?? "Instagram"}
      </Link>
      <h1 className="m-0 font-serif text-[36px] font-semibold leading-[1.05] text-[var(--cacao)] md:text-[46px]">
        {a} {b && <span className="font-medium italic">{b}</span>}
      </h1>
      {children}
    </div>
  );
}

/** En-tête compact des écrans de création sur téléphone. */
export function MobileEditorTitle({ kind, pub, children }: { kind: string; pub: StudioPublication; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/studio" aria-label="Retour" className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[var(--mocha)]/40 bg-[var(--ivoire)] text-[var(--cacao)]">
          <ChevronLeft size={20} aria-hidden="true" />
        </Link>
        <div className="flex min-w-0 flex-col">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--mocha)]">{kind} · {dayLabel(pub.scheduled_date, true)} · {pub.scheduled_time}</span>
          <span className="truncate font-serif text-[22px] font-semibold leading-[1.1] text-[var(--cacao)]">{pub.title}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

/** Enregistrement automatique, 800 ms après la dernière modification. */
export function useAutosave(id: string, payload: unknown, enabled: boolean) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const first = useRef(true);
  const json = JSON.stringify(payload);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!enabled) return;
    const t = setTimeout(async () => {
      setState("saving");
      try {
        const res = await fetch(`/api/studio/publications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: json });
        setState(res.ok ? "saved" : "error");
      } catch {
        setState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [id, json, enabled]);
  return state;
}

export function SaveState({ state }: { state: string }) {
  if (state === "idle") return null;
  return (
    <span className={`text-xs ${muted}`} aria-live="polite">
      {state === "saving" ? "Enregistrement…" : state === "saved" ? "Modifications enregistrées" : "Enregistrement impossible, vérifie ta connexion"}
    </span>
  );
}

export function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 767px)");
    const on = () => setM(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return m;
}

/** Appel de génération ; renvoie « credits » si le solde ne suffit pas. */
export function useGenerate() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (id: string, frames?: number, onDone?: (json: unknown) => void): Promise<"ok" | "credits" | "error"> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, frames }) });
      const json = await res.json();
      if (res.status === 402) return "credits";
      if (!res.ok) {
        setError(json.error ?? "La création n'a pas abouti.");
        return "error";
      }
      onDone?.(json);
      return "ok";
    } catch {
      setError("La création n'a pas abouti. Vérifie ta connexion.");
      return "error";
    } finally {
      setBusy(false);
    }
  }, []);
  return { run, busy, error };
}
