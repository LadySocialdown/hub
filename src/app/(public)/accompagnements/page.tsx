import type { Metadata } from "next";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Accompagnements — Next Level & Level Up, finançables CPF, FAFCEA, OPCO",
  description:
    "Level Up (25h + 1 mois de mentorat) et Next Level (35h + 3 mois de mentorat), finançables via CPF, FAFCEA ou OPCO. Sur candidature.",
};

const CONSULTATION_FLASH_URL = "https://www.ladysocialdown.com/consultation-flash";

const programs = [
  {
    id: "level-up",
    name: "Level Up",
    price: "2000€",
    duration: "25h de formation",
    coaching: "1 mois de mentorat inclus",
    content: [
      "Stratégie réseaux sociaux complète",
      "Création de contenu & calendrier éditorial",
      "Développement de ta communauté",
      "Conversion & vente via les réseaux",
      "Analytics & pilotage de performance",
      "Accès au Cercle Social, un rendez-vous live avec tous les élèves chaque mois",
      "Paiement jusqu'en 4x",
    ],
    forWho:
      "Pour les entrepreneurs qui veulent poser des bases solides et développer leur visibilité.",
  },
  {
    id: "next-level",
    name: "Next Level",
    price: "2800€",
    duration: "35h de formation",
    coaching: "3 mois de mentorat inclus",
    content: [
      "Tout le contenu de Level Up",
      "Stratégie avancée & positionnement premium",
      "Publicité sociale (Meta Ads)",
      "Collaboration & partenariats stratégiques",
      "Automatisation & systèmes",
      "Lancement de produits / services",
      "Accès au Cercle Social, un rendez-vous live avec tous les élèves chaque mois",
      "Paiement jusqu'en 4x",
    ],
    forWho:
      "Pour les entrepreneurs qui veulent aller plus loin et structurer une présence en ligne rentable.",
  },
];

export default function AccompagnementsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-14 space-y-4">
        <span className="inline-block text-xs font-medium px-3 py-1 bg-[var(--mocha-light)] text-[var(--cacao)] rounded-full uppercase tracking-widest">
          Mentorat 1:1 — Sur candidature
        </span>
        <h1
          className="text-4xl sm:text-5xl font-semibold text-[var(--cacao)] leading-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Un accompagnement personnalisé
          <br />
          <em className="font-light italic">pour structurer ton business</em>
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl mx-auto text-lg">
          Level Up et Next Level sont sur candidature : réserve ta consultation flash pour postuler.
          Financés par ton CPF, ton FAFCEA ou ton OPCO, avec paiement jusqu&apos;en 4x disponible pour
          le reste à charge.
        </p>
      </div>

      {/* Programmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="card-lift bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-1">
              <span className="text-xs font-medium px-2.5 py-1 bg-[var(--sable)] text-[var(--mocha)] rounded-full">
                {prog.duration} · {prog.coaching}
              </span>
              <div className="flex items-baseline gap-3 mt-3">
                <h2
                  className="text-2xl font-semibold text-[var(--cacao)]"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {prog.name}
                </h2>
                <span
                  className="text-lg font-semibold text-[var(--mocha)]"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {prog.price}
                </span>
              </div>
              <p className="text-sm text-[var(--noir)] opacity-60">{prog.forWho}</p>
            </div>

            <ul className="space-y-2">
              {prog.content.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--noir)] opacity-70">
                  <CheckCircle size={14} className="shrink-0 mt-0.5 text-[var(--mocha)]" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={CONSULTATION_FLASH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
            >
              Postuler via la consultation flash
              <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>

      {/* Financement CPF : comment ça marche */}
      <div className="bg-[var(--sable)] rounded-2xl border border-[var(--mocha-light)] p-8">
        <p className="text-xs uppercase tracking-[0.25em] font-medium text-[var(--mocha)] mb-2">
          Financement
        </p>
        <h2
          className="text-2xl font-semibold text-[var(--cacao)] mb-6"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Comment financer ta formation via ton CPF ?
        </h2>
        <ol className="space-y-4">
          {[
            "Tu réserves ta consultation flash pour postuler à Level Up ou Next Level.",
            "Si ta candidature est retenue, on constitue ensemble ton dossier CPF.",
            "Délai de rétractation de 11 jours ouvrés (obligatoire MCF).",
            "Ton accès est activé dès la fin du délai de rétractation.",
            "Tu peux payer le reste à charge en 3x ou 4x sans frais.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--mocha-light)] text-[var(--cacao)] text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-[var(--noir)] opacity-70 pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
