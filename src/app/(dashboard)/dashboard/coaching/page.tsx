import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coaching & réservation" };

export default function CoachingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Coaching
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Réserver une session
        </h1>
      </div>
      <div className="bg-white border border-[var(--mocha-light)] rounded-2xl p-8 text-center text-[var(--noir)] opacity-40 text-sm">
        Cal.com embed + Stripe pre-payment — Sprint 5
      </div>
    </div>
  );
}
