import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { BookOpen, Wrench, Calendar, Receipt } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "toi";

  const spaces = [
    {
      href: "/dashboard/formation",
      icon: <BookOpen size={20} />,
      title: "Ma formation",
      description: "Accède à tes modules vidéo et suis ta progression.",
    },
    {
      href: "/dashboard/outils",
      icon: <Wrench size={20} />,
      title: "Mes outils",
      description: "Templates Canva, Notion, guides et check-lists.",
    },
    {
      href: "/dashboard/coaching",
      icon: <Calendar size={20} />,
      title: "Coaching",
      description: "Réserve une session ou consulte tes prochains RDV.",
    },
    {
      href: "/dashboard/factures",
      icon: <Receipt size={20} />,
      title: "Factures",
      description: "Historique de tes paiements et factures Stripe.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Bienvenue
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-sm text-[var(--noir)] opacity-60 mt-1">
          Ton espace personnel Lady Social.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {spaces.map((space) => (
          <Link
            key={space.href}
            href={space.href}
            className="group bg-white border border-[var(--mocha-light)] rounded-2xl p-6 space-y-3 hover:border-[var(--mocha)] hover:shadow-sm transition-all"
          >
            <div className="p-2 w-fit rounded-lg bg-[var(--mocha-light)] text-[var(--cacao)]">
              {space.icon}
            </div>
            <div>
              <h2
                className="text-base font-semibold text-[var(--cacao)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {space.title}
              </h2>
              <p className="text-xs text-[var(--noir)] opacity-60 mt-1 leading-relaxed">
                {space.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
