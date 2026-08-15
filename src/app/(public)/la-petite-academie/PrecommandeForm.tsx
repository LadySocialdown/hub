"use client";

import { useActionState } from "react";
import { createPrecommandeCheckout, type PrecommandeState } from "./actions";

const initialState: PrecommandeState = { ok: false, message: "" };

export function PrecommandeForm() {
  const [state, formAction, isPending] = useActionState(createPrecommandeCheckout, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          required
          className="w-full rounded-full px-5 py-3 text-sm bg-[var(--ivoire)] text-[var(--noir)] placeholder:text-[var(--noir)]/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--ivoire)]"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full rounded-full px-5 py-3 text-sm bg-[var(--ivoire)] text-[var(--noir)] placeholder:text-[var(--noir)]/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--ivoire)]"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-8 py-3 bg-[var(--ivoire)] text-[var(--cacao)] rounded-full text-sm font-semibold hover:bg-[var(--mocha-light)] transition-colors disabled:opacity-60"
      >
        {isPending ? "Redirection vers le paiement…" : "Je réserve ma place, 497€"}
      </button>
      {!state.ok && state.message && (
        <p className="text-sm text-[var(--ivoire)] bg-red-900/30 rounded-lg px-3 py-2">{state.message}</p>
      )}
      <p className="text-xs text-[var(--mocha-light)] opacity-80">
        Paiement sécurisé par Stripe. Accès complet à La Petite Académie à partir du 21 septembre 2026.
        Conformément à la loi, tu disposes d&apos;un droit de rétractation de 14 jours à compter de ton
        paiement.
      </p>
    </form>
  );
}
