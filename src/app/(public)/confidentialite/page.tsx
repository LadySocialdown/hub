// Base de travail rédigée à partir d'informations factuelles standard — pas de relecture
// juridique professionnelle. Voir le récapitulatif transmis à Sania avant promotion large.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et protection des données de Lady Socialdown.",
};

export default function ConfidentialitePage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
        Informations légales
      </p>
      <h1
        className="text-4xl font-semibold text-[var(--cacao)]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Politique de confidentialité
      </h1>
      <p className="text-sm text-[var(--noir)] opacity-50 mt-2 mb-10">
        Dernière mise à jour : 25 août 2026
      </p>

      <div className="space-y-10 text-[var(--noir)] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Responsable du traitement</h2>
          <p className="text-sm">
            Sania Baudhuin, Lady Socialdown —{" "}
            <a href="mailto:contact@ladysocialdown.com" className="text-[var(--mocha)] underline">
              contact@ladysocialdown.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Données collectées</h2>
          <ul className="space-y-1.5 text-sm list-disc pl-5">
            <li>Prénom, email (formulaires de précommande, préinscription, contact)</li>
            <li>
              Données de paiement, traitées directement par Stripe — jamais stockées sur les
              serveurs de Lady Socialdown
            </li>
            <li>Données de connexion et de compte (via Clerk)</li>
            <li>Données de réservation (via Calendly, pour le coaching à la carte)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Finalités</h2>
          <ul className="space-y-1.5 text-sm list-disc pl-5">
            <li>Gestion des précommandes, inscriptions et accès à la plateforme</li>
            <li>Envoi d&apos;emails de confirmation (via Resend)</li>
            <li>
              Gestion de la relation client et actions marketing avec consentement (via
              Systeme.io)
            </li>
            <li>Amélioration du service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">
            Sous-traitants et outils tiers utilisés
          </h2>
          <p className="text-sm">
            Supabase (base de données), Stripe (paiement), Resend (emails transactionnels),
            Systeme.io (CRM/marketing), Clerk (authentification), Calendly (réservation), Vercel
            (hébergement), YouTube (hébergement vidéo des modules de formation, en accès non
            répertorié).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Durée de conservation</h2>
          <p className="text-sm">
            Les données sont conservées pendant la durée nécessaire aux finalités poursuivies, et
            conformément aux durées légales applicables à chaque type de donnée.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Droits des utilisateurs</h2>
          <p className="text-sm">
            Conformément au Règlement Général sur la Protection des Données (RGPD), chaque
            utilisateur dispose d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
            de limitation, d&apos;opposition et de portabilité de ses données, exerçable par email
            à{" "}
            <a href="mailto:contact@ladysocialdown.com" className="text-[var(--mocha)] underline">
              contact@ladysocialdown.com
            </a>
            . En cas de désaccord, l&apos;utilisateur peut saisir la CNIL (
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--mocha)] underline"
            >
              cnil.fr
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Cookies</h2>
          <p className="text-sm">
            Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement
            (authentification, sécurité). Aucun cookie de mesure d&apos;audience ou publicitaire
            n&apos;est déposé à ce jour.
          </p>
        </section>
      </div>
    </section>
  );
}
