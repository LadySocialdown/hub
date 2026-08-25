import type { Metadata } from "next";
import { PrecommandeForm } from "./PrecommandeForm";

export const metadata: Metadata = {
  title: "La Petite Académie",
  description:
    "La Petite Académie ouvre le 21 septembre 2026 : réserve ta place dès maintenant au tarif de lancement à 497€ au lieu de 597€.",
};

// TODO: le reste de la page (piliers, modules, FAQ) sera ajouté au fur et à mesure
// que le contenu de La Petite Académie est finalisé. Pour l'instant, seule la
// section de précommande est en place.

export default function LaPetiteAcademiePage() {
  return (
    <div>
      <section className="bg-[var(--ivoire)] pt-16 pb-12 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
            En autonomie
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            La Petite Académie
          </h1>
          <p className="text-[var(--noir)] opacity-70 text-lg">
            Pose ta stratégie, construis un système de contenu qui vend pour toi, 7j/7.
          </p>
        </div>
      </section>

      {/* Précommande */}
      <section className="bg-glow-light bg-[var(--cacao)] py-20 px-4 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2
            className="text-3xl sm:text-4xl font-semibold text-[var(--ivoire)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Réserve ta place maintenant
          </h2>
          <p className="text-[var(--mocha-light)] leading-relaxed">
            La Petite Académie ouvre le 21 septembre 2026. Réserve ta place dès maintenant au tarif de
            lancement à 497€ au lieu de 597€, et repars avec le module complémentaire « Les bases du
            marketing à connaître avant de commencer » offert, ainsi que l&apos;accès au Cercle Social,
            un live mensuel transversal avec toutes les élèves.
          </p>
          <p className="inline-block text-sm font-medium px-4 py-2 rounded-full bg-[var(--ivoire)]/10 border border-[var(--mocha-light)]/40 text-[var(--ivoire)]">
            Ouverture le 21 septembre 2026 · 497€ au lieu de 597€ + module offert
          </p>

          <div className="pt-2 max-w-md mx-auto">
            <PrecommandeForm />
          </div>
        </div>
      </section>
    </div>
  );
}
