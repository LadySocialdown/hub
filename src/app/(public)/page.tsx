import Link from "next/link";
import { ArrowRight, BookOpen, Wrench, Calendar, Award } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-glow bg-[var(--ivoire)] pt-20 pb-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
            Formation · Outils · Coaching
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-[var(--cacao)] leading-[1.1]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Développe ton activité
            <br />
            <em className="italic font-light">grâce aux réseaux sociaux</em>
          </h1>
          <p className="text-lg text-[var(--noir)] opacity-70 max-w-2xl mx-auto leading-relaxed">
            La plateforme tout-en-un pour les entrepreneurs qui veulent maîtriser
            leur présence en ligne — sans se perdre dans le bruit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
            >
              Commencer gratuitement
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
              Une plateforme, cinq espaces
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
              title="Programme flagship"
              description="7 modules pour maîtriser les réseaux sociaux. Accès progressif, player vidéo sécurisé, ressources par module."
              href="/programmes"
              badge="Formation"
              highlight
            />
            <SpaceCard
              icon={<Wrench size={20} />}
              title="Espace Outils"
              description="Bibliothèque de templates Canva, Notion, guides PDF et check-lists stratégiques filtrables."
              href="/tarifs"
              badge="Essentielle+"
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
              title="Offres CPF"
              description="Programmes intensifs finançables via Mon Compte Formation. 25h ou 35h avec coaching post-formation inclus."
              href="/cpf"
              badge="CPF"
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
              plan="Starter"
              price="Gratuit"
              features={[
                "Ressources gratuites",
                "Module 1 offert",
                "Newsletter hebdomadaire",
              ]}
              cta="Commencer"
              href="/inscription"
            />
            <PricingCard
              plan="Essentielle"
              price="À partir de 29€/mois"
              features={[
                "Programme flagship complet",
                "Espace outils complet",
                "Modules à la carte −20%",
              ]}
              cta="Choisir Essentielle"
              href="/tarifs"
              highlight
            />
            <PricingCard
              plan="VIP"
              price="À partir de 59€/mois"
              features={[
                "Tout Essentielle",
                "1 session coaching/mois",
                "Communauté privée",
                "Accès prioritaire",
              ]}
              cta="Choisir VIP"
              href="/tarifs"
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

      {/* CTA final */}
      <section className="bg-glow-light py-20 px-4 bg-[var(--cacao)] text-center overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2
            className="text-4xl font-semibold text-[var(--ivoire)] leading-tight"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Prête à développer ton activité ?
          </h2>
          <p className="text-[var(--mocha-light)] text-lg opacity-90">
            Rejoins Lady Socialdown et accède au module 1 gratuitement dès aujourd&apos;hui.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ivoire)] text-[var(--cacao)] rounded-full text-sm font-semibold hover:bg-[var(--mocha-light)] transition-colors"
          >
            Démarrer gratuitement
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
  cta,
  href,
  highlight = false,
}: {
  plan: string;
  price: string;
  features: string[];
  cta: string;
  href: string;
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
      <Link
        href={href}
        className={`block text-center px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
          highlight
            ? "bg-[var(--ivoire)] text-[var(--cacao)] hover:bg-[var(--mocha-light)]"
            : "border border-[var(--cacao)] text-[var(--cacao)] hover:bg-[var(--sable)]"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
