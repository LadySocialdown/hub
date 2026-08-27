import type { Metadata } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Précommande confirmée",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paid = false;
  let prenom = "";

  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid";
      prenom = typeof session.metadata?.prenom === "string" ? session.metadata.prenom : "";
    } catch {
      paid = false;
    }
  }

  return (
    <section className="bg-[var(--ivoire)] py-24 px-4 text-center">
      <div className="max-w-lg mx-auto space-y-5">
        {paid ? (
          <>
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">
              Précommande confirmée
            </p>
            <h1
              className="text-3xl sm:text-4xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Merci{prenom ? ` ${prenom}` : ""}, ta place est réservée !
            </h1>
            <p className="text-[var(--noir)] opacity-70 leading-relaxed">
              Un email de confirmation vient de t&apos;être envoyé. Tu auras accès à La Petite Académie
              dès son ouverture, le 21 septembre 2026, avec le module complémentaire « Les bases du
              marketing à connaître avant de commencer » offert.
            </p>
            <p className="text-sm text-[var(--noir)] opacity-50">
              Pense à vérifier tes courriers indésirables si tu ne le vois pas dans les prochaines
              minutes.
            </p>
            <p className="text-sm text-[var(--noir)] opacity-50">
              Conformément à la loi, tu disposes d&apos;un droit de rétractation de 14 jours à compter de
              ton paiement.
            </p>
          </>
        ) : (
          <>
            <h1
              className="text-3xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Paiement introuvable
            </h1>
            <p className="text-[var(--noir)] opacity-70 leading-relaxed">
              Nous n&apos;avons pas pu confirmer ce paiement. Si tu penses qu&apos;il s&apos;agit d&apos;une
              erreur, contacte-nous à{" "}
              <a href="mailto:contact@ladysocialdown.com" className="text-[var(--mocha)] underline">
                contact@ladysocialdown.com
              </a>
              .
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
