"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MONTH_NAMES } from "@/lib/studio/constants";
import { choice, muted, smallTitle } from "./ui";

const PACKS = [
  { n: 5, tag: "Pour finir le mois" },
  { n: 10, tag: "Le plus choisi" },
  { n: 20, tag: "Pack Anticipation" },
];

/** Écran « Plus de crédits » (CreditsEpuises). L'achat arrivera avec Stripe. */
export function CreditsDialog({
  title,
  remainingPlanned,
  onClose,
}: {
  title: string;
  remainingPlanned: number;
  onClose: () => void;
}) {
  const [sel, setSel] = useState(0);
  const [waited, setWaited] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
  const month = MONTH_NAMES[now.getMonth()];
  const nextMonth = MONTH_NAMES[next.getMonth()];
  const hints = [
    `Il te reste ${remainingPlanned} contenu${remainingPlanned > 1 ? "s" : ""} prévu${remainingPlanned > 1 ? "s" : ""} ce mois-ci : ${remainingPlanned <= 5 ? "5 crédits suffisent." : "un pack plus grand sera plus confortable."}`,
    `De quoi finir le mois et commencer ${nextMonth} en avance.`,
    `Prépare tout ${nextMonth} dès maintenant.`,
  ];

  useEffect(() => {
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(43,36,34,0.35)" }}>
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Plus de crédits ce mois-ci"
        className="flex max-h-full w-full max-w-[620px] flex-col gap-[18px] overflow-auto rounded-[28px] bg-[var(--ivoire)] p-6 text-[var(--noir)] outline-none sm:p-8"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        {!waited ? (
          <>
            <div className="flex flex-col gap-1.5">
              <span className={smallTitle}>Crédits de {month} utilisés</span>
              <h1 className="m-0 font-serif text-[34px] font-semibold leading-[1.05] text-[var(--cacao)] sm:text-[40px]">
                Tu as créé tes 20 contenus <span className="font-medium italic">du mois</span>
              </h1>
              <p className={`m-0 text-[15px] ${muted}`}>
                Pour créer « {title} », ajoute des crédits ou attends le renouvellement du 1er {nextMonth}, dans {days} jour{days > 1 ? "s" : ""}.
              </p>
            </div>
            <div role="radiogroup" aria-label="Packs de crédits" className="grid grid-cols-3 gap-2.5">
              {PACKS.map((p, k) => (
                <button
                  key={p.n}
                  type="button"
                  role="radio"
                  aria-checked={k === sel}
                  onClick={() => setSel(k)}
                  className={`flex flex-col items-start gap-1 rounded-2xl p-3.5 text-left text-[var(--cacao)] ${choice(k === sel)}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mocha)]">{p.tag}</span>
                  <span className="font-serif text-[30px] font-bold leading-none">{p.n}</span>
                  <span className="text-[13px]">crédits</span>
                </button>
              ))}
            </div>
            <span className={`text-[13px] ${muted}`}>{hints[sel]}</span>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" disabled className="min-h-[52px] flex-[1_1_240px] cursor-not-allowed rounded-full border-none bg-[var(--cacao)] text-[15px] font-bold text-[var(--ivoire)] opacity-50">
                Bientôt disponible
              </button>
              <button type="button" onClick={() => setWaited(true)} className="min-h-[52px] flex-[1_1_200px] rounded-full border border-[var(--cacao)] bg-transparent text-[15px] text-[var(--cacao)]">
                Attendre le 1er {nextMonth}
              </button>
            </div>
            <span className={`text-center text-xs ${muted}`}>Les crédits ajoutés restent valables 6 mois.</span>
          </>
        ) : (
          <div className="flex flex-col items-start gap-2.5">
            <span className={smallTitle}>C&apos;est noté</span>
            <h1 className="m-0 font-serif text-[34px] font-semibold leading-[1.05] text-[var(--cacao)] sm:text-[40px]">Ce contenu t&apos;attend en {nextMonth}</h1>
            <p className={`m-0 text-[15px] ${muted}`}>
              « {title} » reste dans ton planning en « À créer ». Tu pourras le créer dès le 1er {nextMonth}, avec tes 20 nouveaux crédits. En attendant, tu peux toujours modifier tes textes et préparer tes idées.
            </p>
            <Link href="/dashboard/studio" onClick={onClose} className="rounded-full border border-[var(--cacao)] px-[22px] py-3.5 text-[15px] text-[var(--cacao)] no-underline">
              Retour à ma semaine
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
