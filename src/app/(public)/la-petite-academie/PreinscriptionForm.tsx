"use client";

import { useActionState } from "react";
import { submitPreinscription, type PreinscriptionState } from "./actions";

const initialState: PreinscriptionState = { ok: false, message: "" };

export function PreinscriptionForm() {
  const [state, formAction, isPending] = useActionState(submitPreinscription, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl bg-[var(--ivoire)]/10 border border-[var(--mocha-light)]/40 p-6 text-center">
        <p className="text-lg font-semibold text-[var(--ivoire)]">{state.message}</p>
      </div>
    );
  }

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
        {isPending ? "Envoi en cours…" : "Je me préinscris"}
      </button>
      {!state.ok && state.message && (
        <p className="text-sm text-[var(--ivoire)] bg-red-900/30 rounded-lg px-3 py-2">{state.message}</p>
      )}
      <p className="text-xs text-[var(--mocha-light)] opacity-80">
        Aucun engagement, aucun paiement maintenant. Tu seras contactée dès l&apos;ouverture, avec ton
        tarif préférentiel garanti.
      </p>
    </form>
  );
}
