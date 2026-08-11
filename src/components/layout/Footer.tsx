import Link from "next/link";

const footerLinks = {
  "Formation": [
    { href: "/programmes", label: "Tous les programmes" },
    { href: "/tarifs", label: "Tarifs & abonnements" },
    { href: "/cpf", label: "Financement CPF" },
  ],
  "Ressources": [
    { href: "/ressources", label: "Guides gratuits" },
    { href: "/ressources#articles", label: "Articles" },
    { href: "/ressources#newsletter", label: "Newsletter" },
  ],
  "Coaching": [
    { href: "/dashboard/coaching", label: "Réserver une session" },
    { href: "/tarifs#mentorat", label: "Programme mentorat" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--sable)] border-t border-[var(--mocha-light)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <span
              className="text-2xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Lady Socialdown
            </span>
            <p className="text-sm text-[var(--noir)] opacity-70 leading-relaxed">
              Formation aux réseaux sociaux pour entrepreneurs à Tours, France.
            </p>
            <a
              href="mailto:Contact@ladysocialdown.com"
              className="text-sm text-[var(--mocha)] hover:text-[var(--cacao)] transition-colors block"
            >
              Contact@ladysocialdown.com
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--cacao)]">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--noir)] opacity-70 hover:opacity-100 hover:text-[var(--mocha)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--mocha-light)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--noir)] opacity-50">
          <span>© {new Date().getFullYear()} Lady Socialdown — Tous droits réservés</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:opacity-100 transition-opacity">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:opacity-100 transition-opacity">
              CGV
            </Link>
            <Link href="/confidentialite" className="hover:opacity-100 transition-opacity">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
