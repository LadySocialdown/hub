import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";

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
    hook: "Le déclic peut arriver cette semaine. Pas de théorie générique : on travaille sur TON activité, du premier jour à la fin du mentorat.",
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
    hook: "Ta stratégie, ton offre, ton business : retournés dans tous les sens jusqu'à ce que ça tienne. Le format le plus complet pour une transformation durable.",
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

const TESTIMONIALS = [
  "J'ai avancé plus en une semaine qu'en un an toute seule.",
  "J'ai arrêté de me sentir seule face à mes choix business.",
  "Le format intensif a été un déclic. Je ne pensais pas qu'on pouvait avancer aussi vite.",
];

const FAQ = [
  {
    q: "Quelle est la différence entre Level Up et Next Level ?",
    a: "Next Level va plus loin : plus d'heures de formation individualisée (35h vs 25h) et un mentorat post-formation plus long (3 mois vs 1 mois), pour un accompagnement en profondeur jusqu'à la transformation complète de ton business. Level Up est plus concentré, pour débloquer une situation précise rapidement.",
  },
  {
    q: "Combien de temps dure la formation intensive ?",
    a: "Elle est concentrée sur 5 à 7 jours consécutifs, en visio ou en présentiel selon les disponibilités.",
  },
  {
    q: "Qu'est-ce qui se passe après le mentorat post-formation ?",
    a: "Tu repars autonome, avec une stratégie posée et les outils pour continuer à l'appliquer seule. Un accompagnement plus long peut être proposé si tu le souhaites.",
  },
  {
    q: "Le paiement peut-il être échelonné ?",
    a: "Oui, le reste à charge après financement CPF/FAFCEA/OPCO est payable jusqu'en 4 fois sans frais.",
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
          className="text-4xl sm:text-5xl font-semibold text-[var(--cacao)] leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Tu n&apos;as pas besoin d&apos;un cours de plus. Tu as besoin que quelqu&apos;un
          s&apos;assoie à côté de toi et ne te lâche pas tant que ça ne marche pas.
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl mx-auto text-lg">
          Level Up et Next Level sont sur candidature : réserve ta consultation flash pour postuler.
          Financés par ton CPF, ton FAFCEA ou ton OPCO, avec paiement jusqu&apos;en 4x disponible pour
          le reste à charge.
        </p>
      </div>

      {/* Le problème */}
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
        <h2
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Tu as déjà tout essayé. Et ça n&apos;a pas suffi.
        </h2>
        <p className="text-[var(--noir)] opacity-70 leading-relaxed">
          Les formations en ligne. Les posts « conseils ». Les lives gratuits à minuit parce que
          « c&apos;est là que ça convertit, paraît-il ». Tu as tout fait comme il fallait, et tu
          doutes encore à chaque publication.
        </p>
        <p className="text-[var(--noir)] opacity-70 leading-relaxed">
          La vérité ? Ce n&apos;est pas un problème de stratégie. C&apos;est un problème de
          solitude. Personne ne regarde vraiment TON activité, TES chiffres, TES blocages.
        </p>
        <p className="text-[var(--cacao)] font-semibold text-lg">
          Level Up et Next Level, c&apos;est la fin de cette solitude.
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

            <p className="text-sm text-[var(--cacao)] font-medium leading-relaxed">{prog.hook}</p>

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

      {/* Pour qui / pas pour qui */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        <div className="bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-8 space-y-4">
          <h3
            className="text-xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            C&apos;est fait pour toi si...
          </h3>
          <ul className="space-y-3 text-sm text-[var(--noir)]">
            <li className="flex items-start gap-2.5">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
              Tu as une activité déjà lancée (même débutante)
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
              Tu veux un accompagnement en profondeur, pas juste des conseils généraux
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
              Tu es prête à investir du temps et de l&apos;énergie sur une période intensive
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
              Tu veux que ta stratégie serve un vrai objectif business, pas juste « être visible »
            </li>
          </ul>
        </div>
        <div className="bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-8 space-y-4">
          <h3
            className="text-xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Ce n&apos;est probablement pas pour toi si...
          </h3>
          <ul className="space-y-3 text-sm text-[var(--noir)]">
            <li className="flex items-start gap-2.5">
              <XCircle size={18} className="shrink-0 mt-0.5 opacity-50" />
              <span>
                Tu cherches une formation 100% autonome sans accompagnement (
                <Link href="/la-petite-academie" className="text-[var(--mocha)] underline">
                  voir La Petite Académie
                </Link>
                )
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle size={18} className="shrink-0 mt-0.5 opacity-50" />
              Tu n&apos;as pas encore d&apos;activité définie du tout
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle size={18} className="shrink-0 mt-0.5 opacity-50" />
              Tu cherches un format plus léger et rapide (regarde plutôt Level Up si tu hésites
              avec Next Level)
            </li>
          </ul>
        </div>
      </div>

      {/* Témoignages */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Elles ont arrêté d&apos;avancer seules
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((quote) => (
            <blockquote
              key={quote}
              className="bg-[var(--sable)] rounded-2xl border border-[var(--mocha-light)] p-6 text-[var(--noir)] italic leading-relaxed text-sm"
            >
              « {quote} »
            </blockquote>
          ))}
        </div>
      </div>

      {/* Financement CPF : comment ça marche */}
      <div className="bg-[var(--sable)] rounded-2xl border border-[var(--mocha-light)] p-8 mb-14">
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

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
            Questions fréquentes
          </p>
          <h2
            className="text-3xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            FAQ
          </h2>
        </div>
        <div className="space-y-6">
          {FAQ.map((item) => (
            <div key={item.q} className="border-b border-[var(--mocha-light)] pb-6">
              <h3 className="text-base font-semibold text-[var(--cacao)] mb-1.5">{item.q}</h3>
              <p className="text-sm text-[var(--noir)] opacity-70 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
