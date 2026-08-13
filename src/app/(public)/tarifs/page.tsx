import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tarifs & offres",
  description: "Toutes les offres Lady Socialdown — Next Level, Level Up et La Petite Académie.",
};

const CONSULTATION_FLASH_URL = "https://www.ladysocialdown.com/consultation-flash";

const plans = [
  {
    id: "petite-academie",
    name: "La Petite Académie",
    price: "597€",
    billing: "Payable jusqu'en 4 fois",
    features: [
      "Full e-learning, à ton rythme",
      "+ 1 session de coaching d'1h avec moi",
    ],
    cta: "Je me préinscris",
    href: "/la-petite-academie",
    highlight: false,
  },
  {
    id: "level-up",
    name: "Level Up",
    price: "2000€",
    billing: "Finançable CPF, FAFCEA ou OPCO",
    features: [
      "25h de formation",
      "1 mois de mentorat inclus",
      "Réserve ta consultation flash pour postuler",
      "Paiement jusqu'en 4x",
    ],
    cta: "Postuler via la consultation flash",
    href: CONSULTATION_FLASH_URL,
    highlight: true,
  },
  {
    id: "next-level",
    name: "Next Level",
    price: "2800€",
    billing: "Finançable CPF, FAFCEA ou OPCO",
    features: [
      "35h de formation",
      "3 mois de mentorat inclus",
      "Réserve ta consultation flash pour postuler",
      "Paiement jusqu'en 4x",
    ],
    cta: "Postuler via la consultation flash",
    href: CONSULTATION_FLASH_URL,
    highlight: false,
  },
];

export default function TarifsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
          Nos offres
        </p>
        <h1
          className="text-4xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Tarifs & offres
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl mx-auto">
          Choisis la formule adaptée à ton rythme et tes ambitions.
          Next Level et Level Up sont sur candidature, à réserver via une consultation flash.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card-lift p-8 rounded-2xl border flex flex-col gap-6 ${
              plan.highlight
                ? "bg-[var(--cacao)] border-[var(--cacao)] shadow-warm-lg"
                : "bg-white border-[var(--mocha-light)] shadow-warm"
            }`}
          >
            <div>
              <p
                className={`text-xs uppercase tracking-[0.25em] font-medium mb-2 ${
                  plan.highlight ? "text-[var(--mocha-light)]" : "text-[var(--mocha)]"
                }`}
              >
                {plan.name}
              </p>
              <p
                className={`text-3xl font-semibold ${
                  plan.highlight ? "text-[var(--ivoire)]" : "text-[var(--cacao)]"
                }`}
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {plan.price}
              </p>
              <p
                className={`text-sm mt-1 ${
                  plan.highlight
                    ? "text-[var(--mocha-light)] opacity-80"
                    : "text-[var(--noir)] opacity-50"
                }`}
              >
                {plan.billing}
              </p>
            </div>

            <ul className="space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className={`flex items-start gap-2.5 text-sm ${
                    plan.highlight
                      ? "text-[var(--mocha-light)]"
                      : "text-[var(--noir)] opacity-70"
                  }`}
                >
                  <span className="shrink-0 mt-0.5 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {plan.href ? (
              <Link
                href={plan.href}
                target={plan.href.startsWith("http") ? "_blank" : undefined}
                rel={plan.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`block text-center py-3 rounded-full text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-[var(--ivoire)] text-[var(--cacao)] hover:bg-[var(--mocha-light)]"
                    : "border border-[var(--cacao)] text-[var(--cacao)] hover:bg-[var(--sable)]"
                }`}
              >
                {plan.cta}
              </Link>
            ) : (
              <span className="block text-center py-3 rounded-full text-sm font-medium border border-[var(--mocha-light)] text-[var(--noir)] opacity-50 cursor-not-allowed">
                {plan.cta}
              </span>
            )}
          </div>
        ))}
      </div>

      <div id="mentorat" className="bg-[var(--sable)] rounded-2xl border border-[var(--mocha-light)] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] font-medium text-[var(--mocha)]">
            Coaching & Mentorat
          </p>
          <h2
            className="text-2xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Session coaching 1:1
          </h2>
          <p className="text-sm text-[var(--noir)] opacity-70 max-w-md">
            60 minutes, paiement avant confirmation. Annulation possible jusqu&apos;à 48h avant.
          </p>
        </div>
        <Link
          href="/dashboard/coaching"
          className="shrink-0 px-6 py-3 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
        >
          Réserver une session
        </Link>
      </div>

      <p className="text-center mt-8 text-sm text-[var(--noir)] opacity-50">
        Tu peux aussi financer ta formation via le CPF.{" "}
        <Link href="/cpf" className="text-[var(--mocha)] hover:text-[var(--cacao)] transition-colors">
          Voir les offres CPF →
        </Link>
      </p>
    </div>
  );
}
