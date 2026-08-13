import Link from "next/link";
import { ArrowRight, BookOpen, Wrench, Calendar, Award } from "lucide-react";

const CONSULTATION_FLASH_URL = "https://www.ladysocialdown.com/consultation-flash";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-glow bg-[var(--ivoire)] pt-20 pb-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
            De France Télévisions à tes réseaux sociaux
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
              Trouver mon chemin
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
              Une plateforme, six espaces
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SpaceCard
              icon={<BookOpen size={20} />}
              title="Ressources gratuites"
              description="Guides PDF, articles SEO, replays de lives et capsules vidéo. Accès libre, sans compte requis."
              href="/ressources"
              badge="Gratuit"
            />
            <SpaceCard
              icon={<Award size={20} />}
              title="La Petite Académie"
              description="Pose ta stratégie, construis un système de contenu qui vend pour toi, 7j/7"
              href="/tarifs"
              badge="En autonomie"
              highlight
            />
            <SpaceCard
              icon={<Wrench size={20} />}
              title="Espace Outils"
              description="Bibliothèque de templates Canva, Notion, guides PDF et check-lists stratégiques filtrables."
              href="/tarifs"
              badge="Ressources"
            />
            <SpaceCard
              icon={<Calendar size={20} />}
              title="Coaching & Mentorat"
              description="Sessions 1:1 ponctuelles ou accompagnement long terme. Réservation en ligne, paiement sécurisé avant confirmation."
              href="/tarifs#coaching"
              badge="Sur réservation"
            />
            <SpaceCard
              icon={<Award size={20} />}
              title="Level Up"
              description="Le déclic peut arriver cette semaine. 25h de formation 100% individualisée, suivies d'1 mois de mentorat pour ancrer les résultats. 0€ à avancer grâce au CPF."
              href="/cpf"
              badge="CPF · 100% finançable"
            />
            <SpaceCard
              icon={<Award size={20} />}
              title="Next Level"
              description="Arrête de deviner. Ici, on regarde TON business, on identifie ce qui bloque, et on ne te lâche pas tant que ça ne marche pas. 35h de formation 100% individualisée, suivies de 3 mois de mentorat pour transformer durablement ton business. 0€ à avancer grâce au CPF."
              href="/cpf"
              badge="CPF · 100% finançable"
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
              price="597€"
              features={[
                "Full e-learning, à ton rythme",
                "+ 1 session de coaching d'1h",
                "Payable jusqu'en 4 fois",
              ]}
              cta="Bientôt disponible"
              href={null}
            />
            <PricingCard
              plan="Level Up"
              price="Sur candidature"
              features={[
                "25h de formation 100% individualisée. Pas de théorie générique, on travaille sur TON activité",
                "1 mois de mentorat pour ancrer les résultats et éviter de retomber dans les vieux réflexes",
                "0€ à avancer : financé à 100% par ton CPF",
              ]}
              tagline="Le déclic peut arriver cette semaine."
              cta="Je réserve mon appel découverte"
              href={CONSULTATION_FLASH_URL}
              highlight
            />
            <PricingCard
              plan="Next Level"
              price="Sur candidature"
              features={[
                "35h de formation 100% individualisée. Ta stratégie, ton offre, ton business, retournés dans tous les sens jusqu'à ce que ça tienne",
                "3 mois de mentorat pour transformer durablement ton business, pas juste tes réseaux",
                "0€ à avancer : financé à 100% par ton CPF",
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
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden bg-[var(--mocha)]/40 flex items-center justify-center">
            {/* TODO: remplacer par le portrait de Sania (fichier à fournir) */}
            <span className="text-xs text-[var(--mocha-light)] text-center px-6 opacity-70">
              Photo de Sania à venir
            </span>
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
              cheffe de projet digital chez France Télévisions. Après ça, direction Rosielabsglobal
              pour lancer leur agence française. Franchement, quelle aventure !
            </p>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              J&apos;ai aussi travaillé avec Wunite, une app et communauté incroyable, et Madero France,
              le n°1 francophone des soins drainants et remodelants. Toutes ces expériences m&apos;ont
              fait comprendre que chaque business a ses propres défis sur les réseaux.
            </p>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              Ça fait plusieurs années que je partage mes astuces sur les réseaux sociaux, et en 2025,
              j&apos;ai eu envie de passer au niveau supérieur : accompagner directement les
              entrepreneures qui galèrent avec leur stratégie social media.
            </p>
            <p className="text-[var(--mocha-light)] leading-relaxed">
              Parce que franchement, il n&apos;y a rien de mieux que de voir une entrepreneuse passer
              de « je suis perdue » à « j&apos;y arrive enfin » !
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
            Tu peux continuer à deviner. Ou tu peux enfin avancer.
          </h2>
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ivoire)] text-[var(--cacao)] rounded-full text-sm font-semibold hover:bg-[var(--mocha-light)] transition-colors"
          >
            Découvrir les 3 offres
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
  badge: string;
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
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              highlight
                ? "bg-[var(--mocha-light)]/20 text-[var(--mocha-light)]"
                : "bg-[var(--sable)] text-[var(--mocha)]"
            }`}
          >
            {badge}
          </span>
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
  features,
  tagline,
  cta,
  href,
  highlight = false,
}: {
  plan: string;
  price: string;
  features: string[];
  tagline?: string;
  cta: string;
  href: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card-lift p-6 rounded-2xl border flex flex-col gap-4 ${
        highlight
          ? "bg-[var(--cacao)] border-[var(--cacao)] text-[var(--ivoire)] shadow-warm-lg scale-[1.02]"
          : "bg-white border-[var(--mocha-light)] shadow-warm"
      }`}
    >
      <div>
        <p
          className={`text-xs uppercase tracking-[0.2em] font-medium mb-1 ${
            highlight ? "text-[var(--mocha-light)]" : "text-[var(--mocha)]"
          }`}
        >
          {plan}
        </p>
        <p
          className={`text-xl font-semibold ${
            highlight ? "text-[var(--ivoire)]" : "text-[var(--cacao)]"
          }`}
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {price}
        </p>
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
