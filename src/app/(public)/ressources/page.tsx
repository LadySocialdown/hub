import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ressources gratuites",
  description: "Guides PDF, articles, replays — tout le contenu gratuit de Lady Social.",
};

export default function RessourcesPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
          Accès libre
        </p>
        <h1
          className="text-4xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Ressources gratuites
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl">
          Guides pratiques, articles et replays pour commencer à développer ta présence en ligne.
        </p>
      </div>
      <div className="text-center py-20 text-[var(--noir)] opacity-40 text-sm">
        Contenu en cours d&apos;ajout — Sprint 7
      </div>
    </section>
  );
}
