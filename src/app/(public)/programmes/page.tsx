import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Programmes de formation",
  description: "Découvre tous les programmes Lady Socialdown — du flagship 7 modules aux offres CPF.",
};

export default function ProgrammesPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
          Nos programmes
        </p>
        <h1
          className="text-4xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Tout ce que tu peux apprendre
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-lift p-8 bg-[var(--sable)] shadow-warm rounded-2xl border border-[var(--mocha-light)] space-y-4">
          <span className="text-xs font-medium px-2.5 py-1 bg-[var(--mocha-light)] text-[var(--cacao)] rounded-full">
            Offre de lancement
          </span>
          <h2
            className="text-2xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            La Petite Académie
          </h2>
          <p className="text-sm text-[var(--noir)] opacity-70 leading-relaxed">
            Full e-learning à ton rythme, + 1 session de coaching d&apos;1h avec moi. Module «
            Les bases du marketing à connaître avant de commencer » offert, et accès au Cercle
            Social (live mensuel transversal). Précommande à 497€ au lieu de 597€, accès dès le
            21 septembre 2026.
          </p>
          <Link
            href="/la-petite-academie"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--cacao)] hover:text-[var(--mocha)] transition-colors"
          >
            Je réserve ma place, 497€ <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-lift p-8 bg-[var(--sable)] shadow-warm rounded-2xl border border-[var(--mocha-light)] space-y-4">
          <span className="text-xs font-medium px-2.5 py-1 bg-[var(--mocha-light)] text-[var(--cacao)] rounded-full">
            CPF, FAFCEA, OPCO — Sur candidature
          </span>
          <h2
            className="text-2xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Next Level & Level Up
          </h2>
          <p className="text-sm text-[var(--noir)] opacity-70 leading-relaxed">
            35h + 3 mois de mentorat (2800€), ou 25h + 1 mois de mentorat (2000€), finançables via CPF,
            FAFCEA ou OPCO. Paiement jusqu&apos;en 4x. Réserve ta consultation flash pour postuler.
          </p>
          <Link
            href="/accompagnements"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--cacao)] hover:text-[var(--mocha)] transition-colors"
          >
            Découvrir les accompagnements <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
