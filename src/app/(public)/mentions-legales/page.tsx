// Base de travail rédigée à partir d'informations factuelles standard — pas de relecture
// juridique professionnelle. Voir le récapitulatif transmis à Sania avant promotion large.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Lady Socialdown.",
};

export default function MentionsLegalesPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
        Informations légales
      </p>
      <h1
        className="text-4xl font-semibold text-[var(--cacao)]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Mentions légales
      </h1>
      <p className="text-sm text-[var(--noir)] opacity-50 mt-2 mb-10">
        Dernière mise à jour : 25 août 2026
      </p>

      <div className="space-y-10 text-[var(--noir)] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Éditeur du site</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <strong>Nom et prénom :</strong> Sania Baudhuin
            </li>
            <li>
              <strong>Statut juridique :</strong> Entreprise Individuelle (auto-entrepreneur)
            </li>
            <li>
              <strong>Nom commercial :</strong> Lady Socialdown
            </li>
            <li>
              <strong>Numéro SIRET :</strong> 903 964 906 00031
            </li>
            <li>
              <strong>Adresse :</strong> 1 rue du Grand Pressoir, 37300 Joué-lès-Tours, France
            </li>
            <li>
              <strong>TVA :</strong> TVA non applicable, article 293 B du Code général des impôts
            </li>
            <li>
              <strong>Email de contact :</strong>{" "}
              <a href="mailto:contact@ladysocialdown.com" className="text-[var(--mocha)] underline">
                contact@ladysocialdown.com
              </a>
            </li>
            <li>
              <strong>Directeur de la publication :</strong> Sania Baudhuin
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Hébergement</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <strong>Hébergeur :</strong> Vercel Inc.
            </li>
            <li>
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
            </li>
            <li>
              <strong>Site web :</strong>{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--mocha)] underline"
              >
                vercel.com
              </a>
            </li>
            <li>
              <strong>Email :</strong> privacy@vercel.com
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Propriété intellectuelle</h2>
          <p className="text-sm">
            L&apos;ensemble du contenu de ce site (textes, visuels, logo, structure des programmes)
            est la propriété exclusive de Sania Baudhuin / Lady Socialdown. Toute reproduction,
            représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable,
            est interdite et pourra donner lieu à des poursuites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--cacao)] mb-3">Droit applicable</h2>
          <p className="text-sm">
            Le présent site est soumis au droit français. Tout litige relatif à son utilisation
            relève de la compétence exclusive des tribunaux du ressort de Tours, sous réserve des
            règles impératives applicables aux consommateurs.
          </p>
        </section>
      </div>
    </section>
  );
}
