import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ma formation" };

export default function FormationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace formation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Ma formation
        </h1>
      </div>
      <div className="bg-white border border-[var(--mocha-light)] rounded-2xl p-8 text-center text-[var(--noir)] opacity-40 text-sm">
        Player Mux + modules — Sprint 3
      </div>
    </div>
  );
}
