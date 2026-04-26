import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Offres CPF — Formation finançable",
  description:
    "Programmes intensifs 25h et 35h finançables via Mon Compte Formation. Coaching post-formation inclus.",
};

const programs = [
  {
    id: "25h",
    name: "Programme Intensif 25h",
    duration: "25 heures",
    coaching: "1 mois de coaching post-formation",
    content: [
      "Stratégie réseaux sociaux complète",
      "Création de contenu & calendrier éditorial",
      "Développement de ta communauté",
      "Conversion & vente via les réseaux",
      "Analytics & pilotage de performance",
    ],
    forWho:
      "Pour les entrepreneurs qui veulent poser des bases solides et développer leur visibilité.",
  },
  {
    id: "35h",
    name: "Programme Élite 35h",
    duration: "35 heures",
    coaching: "3 mois de coaching post-formation",
    content: [
      "Tout le programme 25h",
      "Stratégie avancée & positionnement premium",
      "Publicité sociale (Meta Ads)",
      "Collaboration & partenariats stratégiques",
      "Automatisation & systèmes",
      "Lancement de produits / services",
    ],
    forWho:
      "Pour les entrepreneurs qui veulent aller plus loin et structurer une présence en ligne rentable.",
  },
];

export default function CpfPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-14 space-y-4">
        <span className="inline-block text-xs font-medium px-3 py-1 bg-[var(--mocha-light)] text-[var(--cacao)] rounded-full uppercase tracking-widest">
          Finançable CPF
        </span>
        <h1
          className="text-4xl sm:text-5xl font-semibold text-[var(--cacao)] leading-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Des programmes finançables
          <br />
          <em className="font-light italic">via Mon Compte Formation</em>
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl mx-auto text-lg">
          Utilise tes droits CPF pour financer ta formation aux réseaux sociaux.
          Paiement fractionné 3x ou 4x disponible pour le reste à charge.
        </p>
      </div>

      {/* Programmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white border border-[var(--mocha-light)] rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-1">
              <span className="text-xs font-medium px-2.5 py-1 bg-[var(--sable)] text-[var(--mocha)] rounded-full">
                {prog.duration} · {prog.coaching}
              </span>
              <h2
                className="text-2xl font-semibold text-[var(--cacao)] mt-3"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {prog.name}
              </h2>
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

            <Link
              href={`/cpf/dossier?program=${prog.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
            >
              Déposer mon dossier
              <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>

      {/* Comment ça marche */}
      <div className="bg-[var(--sable)] rounded-2xl border border-[var(--mocha-light)] p-8">
        <h2
          className="text-2xl font-semibold text-[var(--cacao)] mb-6"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Comment ça marche ?
        </h2>
        <ol className="space-y-4">
          {[
            "Tu déposes ton dossier via le formulaire sécurisé.",
            "Nous validons ton dossier et le transmettons à Mon Compte Formation.",
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
