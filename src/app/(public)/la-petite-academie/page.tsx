import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { PrecommandeForm } from "./PrecommandeForm";

export const metadata: Metadata = {
  title: "La Petite Académie",
  description:
    "La Petite Académie ouvre le 21 septembre 2026 : réserve ta place dès maintenant au tarif de lancement à 497€ au lieu de 597€.",
};

const PILLARS = [
  {
    title: "La Stratégie qui change tout",
    modules: ["Arrête de poster au hasard", "Dans la tête de ta cliente", "L'offre qu'on ne peut pas refuser"],
  },
  {
    title: "Le Contenu qui vend",
    modules: ["Raconte, ne vends pas", "La story qui convertit", "Le contenu qui arrête le scroll"],
  },
  {
    title: "Le Système qui tourne sans toi",
    modules: ["Ta machine à contenu", "L'IA à ton service", "Tes chiffres, ta boussole"],
  },
  {
    title: "Les Fondations pour scaler",
    modules: ["Premiers leviers d'acquisition", "Le marketing enfin clair", "Prête à passer au niveau supérieur"],
  },
];

const TESTIMONIALS = [
  "Mon système de contenu tourne enfin tout seul, sans que j'y passe mes soirées.",
  "J'ai enfin une offre claire, et mes prospects la comprennent en 5 secondes.",
];

const COMPLEMENTARY_MODULES = ["Acquisition", "Création de page de vente", "Scaler son business"];

const FAQ = [
  {
    q: "Combien de temps pour suivre le programme ?",
    a: "À ton rythme. L'accès est illimité dans le temps, tu avances quand tu veux.",
  },
  {
    q: "Il y a de l'accompagnement ou c'est 100% seule ?",
    a: "E-learning + Le Cercle Social + 1h de coaching en 1:1 avec moi : un live collectif mensuel transversal, ouvert à tous les élèves. Réserve ta session de coaching à tout moment.",
  },
  {
    q: "Le paiement peut être échelonné ?",
    a: "Oui, le paiement peut se faire en 3 fois. En cas de précommande, le paiement est intégral (497€).",
  },
  {
    q: "Puis-je ajouter les modules complémentaires plus tard ?",
    a: "Oui, à tout moment.",
  },
];

export default function LaPetiteAcademiePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--ivoire)] pt-16 pb-12 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
            En autonomie
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Arrête de bricoler ta stratégie. Construis un système qui vend, pour de vrai.
          </h1>
          <p className="text-[var(--noir)] opacity-70 text-lg">
            12 modules, 4 piliers, un système de contenu complet pour poser ta stratégie, créer une
            offre claire et vendre sans t&apos;épuiser. En autonomie, à ton rythme, 7j/7.
          </p>
        </div>
      </section>

      {/* Le problème */}
      <section className="bg-[var(--sable)] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2
            className="text-3xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Tu postes. Tu postes encore. Et rien ne se passe.
          </h2>
          <p className="text-[var(--noir)] opacity-70 leading-relaxed">
            Ce n&apos;est pas un manque de travail. C&apos;est l&apos;absence d&apos;un système
            pour transformer ce que tu publies en clientes réelles. Sans stratégie, sans offre
            claire, sans méthode pour convertir, même le meilleur contenu tourne dans le vide.
          </p>
          <p className="text-[var(--cacao)] font-semibold text-lg">
            La Petite Académie, c&apos;est la fin de l&apos;improvisation.
          </p>
        </div>
      </section>

      {/* Le programme */}
      <section className="bg-[var(--ivoire)] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
              Le programme
            </p>
            <h2
              className="text-3xl sm:text-4xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              4 piliers, 12 modules
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.title}
                className="card-lift bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-6 space-y-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--mocha)]">
                  Pilier {i + 1}
                </p>
                <h3
                  className="text-lg font-semibold text-[var(--cacao)]"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {pillar.title}
                </h3>
                <ul className="space-y-1.5 text-sm text-[var(--noir)] opacity-80">
                  {pillar.modules.map((m) => (
                    <li key={m}>— {m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui / pas pour qui */}
      <section className="bg-[var(--sable)] py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-8 space-y-4">
            <h3
              className="text-xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Pour toi si
            </h3>
            <ul className="space-y-3 text-sm text-[var(--noir)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
                Tu as une activité et tu veux une vraie méthode
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
                Tu es autonome
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-[var(--cacao)]" />
                Tu veux un système à ton rythme
              </li>
            </ul>
          </div>
          <div className="bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-8 space-y-4">
            <h3
              className="text-xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Pas pour toi si
            </h3>
            <ul className="space-y-3 text-sm text-[var(--noir)]">
              <li className="flex items-start gap-2.5">
                <XCircle size={18} className="shrink-0 mt-0.5 opacity-50" />
                <span>
                  Tu as besoin d&apos;un accompagnement 1:1 poussé (
                  <Link href="/cpf" className="text-[var(--mocha)] underline">
                    voir Level Up / Next Level
                  </Link>
                  )
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle size={18} className="shrink-0 mt-0.5 opacity-50" />
                Tu cherches une solution miracle sans rien appliquer
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-[var(--ivoire)] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
              Elles en parlent
            </p>
            <h2
              className="text-3xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Ce qu&apos;elles disent
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((quote) => (
              <blockquote
                key={quote}
                className="bg-[var(--sable)] rounded-2xl border border-[var(--mocha-light)] p-6 text-[var(--noir)] italic leading-relaxed"
              >
                « {quote} »
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Envie d'aller plus loin */}
      <section className="bg-[var(--sable)] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
              Pour aller plus loin
            </p>
            <h2
              className="text-3xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Envie d&apos;aller plus loin ?
            </h2>
          </div>
          <p className="text-[var(--noir)] opacity-70 max-w-xl mx-auto">
            Des modules complémentaires, disponibles en supplément pour approfondir des sujets
            précis :
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {COMPLEMENTARY_MODULES.map((m) => (
              <span
                key={m}
                className="px-4 py-2 bg-white border border-[var(--mocha-light)] rounded-full text-sm text-[var(--cacao)] font-medium"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--noir)] opacity-50">
            (le module « Les bases du marketing à connaître avant de commencer » est lui offert
            dès la précommande, voir ci-dessous)
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
            un live mensuel transversal avec tous les élèves.
          </p>
          <p className="inline-block text-sm font-medium px-4 py-2 rounded-full bg-[var(--ivoire)]/10 border border-[var(--mocha-light)]/40 text-[var(--ivoire)]">
            Ouverture le 21 septembre 2026 · 497€ au lieu de 597€ + module offert
          </p>

          <div className="pt-2 max-w-md mx-auto">
            <PrecommandeForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--ivoire)] py-20 px-4">
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
      </section>
    </div>
  );
}
