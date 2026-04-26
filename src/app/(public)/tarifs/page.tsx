import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tarifs & abonnements",
  description: "Toutes les offres Lady Social — abonnements mensuels, annuels et accès à vie.",
};

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "Gratuit",
    billing: "Pour toujours",
    features: [
      "Accès aux ressources gratuites",
      "Module 1 du programme flagship",
      "Newsletter hebdomadaire",
    ],
    cta: "Commencer",
    href: "/inscription",
    highlight: false,
  },
  {
    id: "essentielle",
    name: "Essentielle",
    price: "29€",
    billing: "par mois (ou 290€/an)",
    features: [
      "Programme flagship complet (7 modules)",
      "Espace outils complet",
      "Modules à la carte à −20%",
      "Ressources téléchargeables illimitées",
    ],
    cta: "Choisir Essentielle",
    href: "/inscription?plan=essentielle",
    highlight: true,
  },
  {
    id: "vip",
    name: "VIP",
    price: "59€",
    billing: "par mois (ou 590€/an)",
    features: [
      "Tout ce qui est inclus dans Essentielle",
      "1 session coaching/mois incluse",
      "Communauté privée",
      "Modules à la carte à −30%",
      "Accès prioritaire aux nouveautés",
    ],
    cta: "Choisir VIP",
    href: "/inscription?plan=vip",
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
          Tarifs & abonnements
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl mx-auto">
          Choisis la formule adaptée à ton rythme et tes ambitions.
          Résilie quand tu veux, sans engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-8 rounded-2xl border flex flex-col gap-6 ${
              plan.highlight
                ? "bg-[var(--cacao)] border-[var(--cacao)]"
                : "bg-white border-[var(--mocha-light)]"
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

            <Link
              href={plan.href}
              className={`block text-center py-3 rounded-full text-sm font-medium transition-colors ${
                plan.highlight
                  ? "bg-[var(--ivoire)] text-[var(--cacao)] hover:bg-[var(--mocha-light)]"
                  : "border border-[var(--cacao)] text-[var(--cacao)] hover:bg-[var(--sable)]"
              }`}
            >
              {plan.cta}
            </Link>
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
