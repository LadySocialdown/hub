import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { GrantAccessForm } from "./GrantAccessForm";

export const metadata: Metadata = { title: "Accès formation — Admin" };

export default async function AdminFormationPage() {
  await requireAdminPage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace formation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Accès élèves
        </h1>
        <p className="text-sm text-[var(--noir)] opacity-60 mt-1">
          La Petite Académie est accordée automatiquement au paiement. Next Level et Level Up
          se déclenchent ici, manuellement.
        </p>
      </div>

      <GrantAccessForm />
    </div>
  );
}
