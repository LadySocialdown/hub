import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Factures & paiements" };

function formatAmount(centimes: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    centimes / 100
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );
}

const ITEM_LABELS: Record<string, string> = {
  subscription: "Abonnement",
  resource: "Ressource",
  formation: "Formation",
  precommande: "Précommande La Petite Académie",
};

export default async function FacturesPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;

  const supabase = createServerSupabaseClient();

  const [{ data: purchases }, { data: subscriptions }, { data: precommandes }] = await Promise.all([
    supabase
      .from("purchases")
      .select("id, item_type, item_id, stripe_payment_id, amount, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("id, plan, status, period_end, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    email
      ? supabase
          .from("precommandes_academie")
          .select("id, montant, paid_at, statut")
          .eq("email", email)
          .order("paid_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const hasPurchases =
    (purchases?.length ?? 0) > 0 ||
    (subscriptions?.length ?? 0) > 0 ||
    (precommandes?.length ?? 0) > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Facturation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Mes factures
        </h1>
      </div>

      {!hasPurchases ? (
        <div className="bg-white border border-[var(--mocha-light)] rounded-2xl p-10 text-center">
          <p className="text-[var(--cacao)] font-medium">Aucun achat enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {(subscriptions?.length ?? 0) > 0 && (
            <section>
              <h2
                className="text-xl font-semibold text-[var(--cacao)] mb-4"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Abonnements
              </h2>
              <div className="bg-white border border-[var(--mocha-light)] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--sable)] text-[var(--cacao)] text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Offre</th>
                      <th className="px-6 py-3 text-left">Statut</th>
                      <th className="px-6 py-3 text-left">Prochaine échéance</th>
                      <th className="px-6 py-3 text-left">Depuis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--mocha-light)]">
                    {subscriptions!.map((sub) => (
                      <tr key={sub.id} className="text-[var(--noir)]">
                        <td className="px-6 py-4 font-medium capitalize">{sub.plan}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              sub.status === "active"
                                ? "bg-green-100 text-green-700"
                                : sub.status === "trialing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {sub.status === "active"
                              ? "Actif"
                              : sub.status === "trialing"
                              ? "Essai"
                              : sub.status === "past_due"
                              ? "Impayé"
                              : "Annulé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 opacity-70">{formatDate(sub.period_end)}</td>
                        <td className="px-6 py-4 opacity-70">{formatDate(sub.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {((purchases?.length ?? 0) > 0 || (precommandes?.length ?? 0) > 0) && (
            <section>
              <h2
                className="text-xl font-semibold text-[var(--cacao)] mb-4"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                Achats
              </h2>
              <div className="bg-white border border-[var(--mocha-light)] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--sable)] text-[var(--cacao)] text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Désignation</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--mocha-light)]">
                    {purchases?.map((p) => (
                      <tr key={p.id} className="text-[var(--noir)]">
                        <td className="px-6 py-4 font-medium">
                          {ITEM_LABELS[p.item_type] ?? p.item_type}
                        </td>
                        <td className="px-6 py-4 opacity-70">{formatDate(p.created_at)}</td>
                        <td className="px-6 py-4 text-right">{formatAmount(p.amount)}</td>
                      </tr>
                    ))}
                    {precommandes?.map((pc) => (
                      <tr key={pc.id} className="text-[var(--noir)]">
                        <td className="px-6 py-4 font-medium">
                          Précommande La Petite Académie
                        </td>
                        <td className="px-6 py-4 opacity-70">{formatDate(pc.paid_at)}</td>
                        <td className="px-6 py-4 text-right">{formatAmount(pc.montant)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
