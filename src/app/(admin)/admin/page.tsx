import type { Metadata } from "next";
import Link from "next/link";
import { Users, BookOpen, Calendar, BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Lady Social" };

const adminLinks = [
  { href: "/admin/eleves-cpf", icon: <Users size={18} />, label: "Élèves CPF", desc: "Gestion des dossiers et exports" },
  { href: "/admin/contenus", icon: <BookOpen size={18} />, label: "Contenus", desc: "Modules, outils, ressources" },
  { href: "/admin/reservations", icon: <Calendar size={18} />, label: "Réservations", desc: "Vue globale des sessions coaching" },
  { href: "/admin/instagram", icon: <BarChart3 size={18} />, label: "Instagram", desc: "Analyse automatisée @ladysocialdown" },
];

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Administration
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Dashboard admin
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card-lift group bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-6 space-y-3 hover:border-[var(--mocha)]"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--mocha-light)] text-[var(--cacao)] transition-colors group-hover:bg-[var(--cacao)] group-hover:text-[var(--ivoire)]">
              {link.icon}
            </div>
            <div>
              <h2
                className="text-base font-semibold text-[var(--cacao)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {link.label}
              </h2>
              <p className="text-xs text-[var(--noir)] opacity-60 mt-1">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
