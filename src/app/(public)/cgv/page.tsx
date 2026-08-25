// Base de travail rédigée à partir d'informations factuelles standard — pas de relecture
// juridique professionnelle. Voir le récapitulatif transmis à Sania avant promotion large,
// notamment pour le médiateur de la consommation à choisir avant publication finale.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de Lady Socialdown.",
};

export default function CgvPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
        Informations légales
      </p>
      <h1
        className="text-4xl font-semibold text-[var(--cacao)]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Conditions générales de vente
      </h1>
      <p className="text-sm text-[var(--noir)] opacity-50 mt-2 mb-10">
        Dernière mise à jour : 25 août 2026
      </p>

      <div className="space-y-10 text-[var(--noir)] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Préambule</h2>
          <p className="text-sm">
            Les présentes conditions générales de vente s&apos;appliquent à toutes les ventes
            réalisées sur app.ladysocialdown.com par Sania Baudhuin, Entreprise Individuelle,
            SIRET 903 964 906 00031.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">
            Produits et services concernés
          </h2>
          <ul className="space-y-4 text-sm">
            <li>
              <strong>La Petite Académie</strong> — actuellement en précommande à 497€ (tarif de
              lancement, prix plein 597€), incluant le module complémentaire « Les bases du
              marketing à connaître avant de commencer » offert. Accès prévu à partir du
              21 septembre 2026. Paiement en une fois via Stripe.
            </li>
            <li>
              <strong>Mentorats CPF (Next Level, Level Up)</strong> — vente sur candidature, après
              appel découverte, paiement en une ou plusieurs fois (jusqu&apos;à 4x maximum),
              financement CPF possible.
            </li>
            <li>
              <strong>Coaching à la carte</strong> — session ponctuelle de 2h à 150€, paiement
              intégral à la réservation via Calendly.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Modalités de paiement</h2>
          <p className="text-sm">
            Les paiements sont sécurisés via Stripe (précommande La Petite Académie), ou selon les
            modalités propres à chaque offre : virement ou prélèvement pour les mentorats CPF,
            Calendly pour le coaching à la carte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Droit de rétractation</h2>
          <p className="text-sm">
            Conformément aux articles L221-18 et suivants du Code de la consommation, le client
            dispose d&apos;un délai de 14 jours à compter du paiement pour exercer son droit de
            rétractation, sauf pour les prestations pleinement exécutées avant la fin de ce délai
            avec l&apos;accord exprès du client.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">
            Politique d&apos;annulation — Coaching à la carte
          </h2>
          <ul className="space-y-1.5 text-sm list-disc pl-5">
            <li>Annulation à 4 jours ou plus avant la séance : remboursement à 70%.</li>
            <li>Annulation à moins de 4 jours avant la séance : non remboursable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">
            Précommande La Petite Académie
          </h2>
          <p className="text-sm">
            Le paiement de 497€ vaut réservation d&apos;accès à l&apos;ouverture du programme,
            prévue le 21 septembre 2026. En cas de retard significatif de l&apos;ouverture, le
            client en sera informé par email et pourra demander un remboursement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">
            Réclamations et médiation
          </h2>
          <p className="text-sm">
            Pour toute réclamation, le client peut contacter Lady Socialdown à l&apos;adresse{" "}
            <a href="mailto:contact@ladysocialdown.com" className="text-[var(--mocha)] underline">
              contact@ladysocialdown.com
            </a>
            . En cas de désaccord persistant, le client a la possibilité de recourir gratuitement à
            un médiateur de la consommation, dont les coordonnées seront communiquées sur simple
            demande à cette même adresse.
          </p>
        </section>
      </div>
    </section>
  );
}
