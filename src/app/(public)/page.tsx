import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Wrench, Calendar } from "lucide-react";

const CONSULTATION_FLASH_URL = "https://www.ladysocialdown.com/consultation-flash";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-glow bg-[var(--ivoire)] pt-20 pb-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
            Stratégie · Contenu · Conversion
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-[var(--cacao)] leading-[1.1]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Tu postes, tu t&apos;épuises, mais les clients ne viennent pas
          </h1>
          <p className="text-lg text-[var(--noir)] opacity-70 max-w-2xl mx-auto leading-relaxed">
            3 options pour transformer tes réseaux en vraie machine à clients
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
            >
              Je veux enfin avancer
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/programmes"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[var(--mocha-light)] text-[var(--noir)] rounded-full text-sm font-medium hover:bg-[var(--sable)] transition-colors"
            >
              Voir les programmes
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="bg-[var(--sable)] py-4 border-y border-[var(--mocha-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-[var(--noir)] opacity-60">
            Rejoins des centaines d&apos;entrepreneurs qui développent leur activité avec Lady Socialdown
          </p>
        </div>
      </div>

      {/* Les 5 espaces */}
      <section className="py-20 px-4 bg-[var(--ivoire)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
              Tout ce qu&apos;il te faut
            </p>
            <h2
              className="text-4xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              1 plateforme, 3 espaces
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpaceCard
              icon={<BookOpen size={20} />}
              title="Espace Formation"
              description="Des programmes complets et un accompagnement pour structurer ta stratégie et créer du contenu qui vend, jusqu'à l'action concrète."
              href="/programmes"
            />
            <SpaceCard
              icon={<Wrench size={20} />}
              title="Ta boîte à ressources"
              description="Guides, templates et outils en libre accès pour avancer à ton rythme, gratuits ou approfondis."
              href="/ressources"
            />
            <SpaceCard
              icon={<Calendar size={20} />}
              title="Mentorat & suivi"
              description="Du coaching 1:1 exclusivement, jamais en groupe : on va à fond sur TON projet, avec un suivi qui continue après la formation pour ancrer les résultats. Et une fois par mois, retrouve tous les élèves lors du Cercle Social."
              href="/tarifs#mentorat"
            />
          </div>
        </div>
      </section>

      {/* Les offres */}
      <section className="py-20 px-4 bg-[var(--sable)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
              À ton rythme
            </p>
            <h2
              className="text-4xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Choisis la formule qui te correspond
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              plan="La Petite Académie"
              price="497€"
              oldPrice="597€"
              badge="Offre de lancement"
              features={[
                "Full e-learning, à ton rythme",
                "+ 1 session de coaching d'1h avec moi",
                "Module « Les bases du marketing à connaître avant de commencer » offert",
                "Accès au Cercle Social, un live mensuel transversal avec tous les élèves",
              ]}
              tagline="Précommande — accès dès le 21 septembre 2026"
              cta="Je réserve ma place, 497€"
              href="/la-petite-academie"
            />
            <PricingCard
              plan="Level Up"
              price="2000€"
              features={[
                "25h de formation 100% individualisée. Pas de théorie générique, on travaille sur TON activité",
                "1 mois de mentorat pour ancrer les résultats et éviter de retomber dans les vieux réflexes",
                "0€ à avancer : financé à 100% par ton CPF, FAFCEA ou OPCO",
                "Paiement jusqu'en 4x",
              ]}
              tagline="Le déclic peut arriver cette semaine."
              cta="Je réserve mon appel découverte"
              href={CONSULTATION_FLASH_URL}
              highlight
            />
            <PricingCard
              plan="Next Level"
              price="2800€"
              features={[
                "35h de formation 100% individualisée. Ta stratégie, ton offre, ton business, retournés dans tous les sens jusqu'à ce que ça tienne",
                "3 mois de mentorat pour transformer durablement ton business, pas juste tes réseaux",
                "0€ à avancer : financé à 100% par ton CPF, FAFCEA ou OPCO",
                "Paiement jusqu'en 4x",
              ]}
              tagline="Tu peux continuer à deviner. Ou tu peux enfin avancer."
              cta="Je réserve mon appel découverte"
              href={CONSULTATION_FLASH_URL}
            />
          </div>

          <p className="text-center mt-8 text-sm text-[var(--noir)] opacity-60">
            Tu peux aussi financer ta formation via le CPF.{" "}
            <Link href="/cpf" className="text-[var(--mocha)] hover:text-[var(--cacao)] transition-colors">
              En savoir plus →
            </Link>
          </p>
        </div>
      </section>

      {/* À propos / Expertise */}
      <section className="bg-[var(--cacao)] py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden bg-[var(--mocha)]/40">
            <Image
              src="/sania-portrait.jpg"
              alt="Sania, fondatrice de Lady Socialdown"
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-5 text-center md:text-left">
            <h2
              className="text-4xl sm:text-5xl italic font-light text-[var(--ivoire)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Salut, moi c&apos;est Sania !
            </h2>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              J&apos;ai débuté comme Social Media Manager, puis j&apos;ai travaillé en tant que
              cheffe de projet digital chez France Télévisions. Après ça, direction RosieLabs Global 🇺🇸
              pour lancer leur agence française et le département social media & acquisition.
              Franchement, quelle aventure !
            </p>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              J&apos;ai aussi travaillé avec Wunite, une app et communauté incroyable de femmes de
              footballeurs, et MaderoFrance, le n°1 francophone des soins drainants et remodelants.
              Toutes ces expériences m&apos;ont fait comprendre que chaque business a ses propres défis
              sur les réseaux : acquisition clients, visibilité, autorité de marque, conversion...
            </p>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              Ça fait plusieurs années que je partage mes astuces sur les réseaux sociaux et en 2025,
              j&apos;ai eu envie de passer au niveau supérieur : accompagner directement les
              entrepreneurs qui galèrent avec leur stratégie social media à créer de vrais écosystèmes
              pour un business durable et rentable.
            </p>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              Parce qu&apos;il n&apos;y a rien de mieux que de voir un entrepreneur passer de « je
              suis perdu » à « j&apos;y arrive enfin » et « je vis de mon activité » !
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-glow-light py-20 px-4 bg-[var(--cacao)] text-center overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2
            className="text-4xl font-semibold text-[var(--ivoire)] leading-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Tu peux continuer à deviner.
            <br />
            Ou tu peux enfin avancer.
          </h2>
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ivoire)] text-[var(--cacao)] rounded-full text-sm font-semibold hover:bg-[var(--mocha-light)] transition-colors"
          >
            Découvrir
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

function SpaceCard({
  icon,
  title,
  description,
  href,
  badge,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card-lift group block p-6 rounded-2xl border ${
        highlight
          ? "bg-[var(--cacao)] border-[var(--cacao)] text-[var(--ivoire)] shadow-warm"
          : "bg-white border-[var(--mocha-light)] shadow-warm hover:border-[var(--mocha)]"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`p-2 rounded-lg ${
              highlight
                ? "bg-[var(--mocha-light)]/20 text-[var(--mocha-light)]"
                : "bg-[var(--mocha-light)] text-[var(--cacao)]"
            }`}
          >
            {icon}
          </div>
          {badge && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                highlight
                  ? "bg-[var(--mocha-light)]/20 text-[var(--mocha-light)]"
                  : "bg-[var(--sable)] text-[var(--mocha)]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <h3
          className={`text-lg font-semibold ${
            highlight ? "text-[var(--ivoire)]" : "text-[var(--cacao)]"
          }`}
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {title}
        </h3>
        <p
          className={`text-sm leading-relaxed ${
            highlight ? "text-[var(--mocha-light)] opacity-90" : "text-[var(--noir)] opacity-70"
          }`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}

function PricingCard({
  plan,
  price,
  oldPrice,
  badge,
  features,
  tagline,
  cta,
  href,
  highlight = false,
}: {
  plan: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  features: string[];
  tagline?: string;
  cta: string;
  href: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card-lift p-6 rounded-2xl border flex flex-col gap-4 relative ${
        highlight
          ? "bg-[var(--cacao)] border-[var(--cacao)] text-[var(--ivoire)] shadow-warm-lg scale-[1.02]"
          : badge
          ? "bg-white border-[var(--cacao)] border-2 shadow-warm-lg"
          : "bg-white border-[var(--mocha-light)] shadow-warm"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--cacao)] text-[var(--ivoire)] text-xs font-semibold uppercase tracking-[0.15em] shadow-warm whitespace-nowrap">
          {badge}
        </span>
      )}
      <div>
        <p
          className={`text-xs uppercase tracking-[0.2em] font-medium mb-1 ${
            highlight ? "text-[var(--mocha-light)]" : "text-[var(--mocha)]"
          }`}
        >
          {plan}
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p
            className={`text-3xl font-bold ${
              highlight ? "text-[var(--ivoire)]" : "text-[var(--cacao)]"
            }`}
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {price}
          </p>
          {oldPrice && (
            <p
              className={`text-base line-through ${
                highlight ? "text-[var(--mocha-light)] opacity-70" : "text-[var(--noir)] opacity-40"
              }`}
            >
              {oldPrice}
            </p>
          )}
        </div>
      </div>
      <ul className="space-y-2 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-2 text-sm ${
              highlight ? "text-[var(--mocha-light)]" : "text-[var(--noir)] opacity-70"
            }`}
          >
            <span className="mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
      {tagline && (
        <p
          className={`text-sm italic font-medium ${
            highlight ? "text-[var(--ivoire)]" : "text-[var(--cacao)]"
          }`}
        >
          {tagline}
        </p>
      )}
      {href ? (
        <Link
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className={`block text-center px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
            highlight
              ? "bg-[var(--ivoire)] text-[var(--cacao)] hover:bg-[var(--mocha-light)]"
              : "border border-[var(--cacao)] text-[var(--cacao)] hover:bg-[var(--sable)]"
          }`}
        >
          {cta}
        </Link>
      ) : (
        <span
          className={`block text-center px-4 py-2.5 rounded-full text-sm font-medium cursor-not-allowed opacity-60 ${
            highlight ? "border border-[var(--ivoire)]" : "border border-[var(--mocha-light)]"
          }`}
        >
          {cta}
        </span>
      )}
    </div>
  );
}
