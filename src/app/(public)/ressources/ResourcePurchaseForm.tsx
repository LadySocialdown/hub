"use client";

import { useActionState } from "react";
import { createResourceCheckout, type ResourceCheckoutState } from "./actions";

const initialState: ResourceCheckoutState = { ok: false, message: "" };

export function ResourcePurchaseForm({ resourceId, priceLabel }: { resourceId: string; priceLabel: string }) {
  const [state, formAction, isPending] = useActionState(createResourceCheckout, initialState);

  return (
    <form action={formAction} className="space-y-2.5">
      <input type="hidden" name="resourceId" value={resourceId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          name="nom"
          placeholder="Ton nom"
          required
          className="w-full rounded-full px-4 py-2 text-sm border border-[var(--mocha-light)] focus:border-[var(--cacao)] focus:outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Ton email"
          required
          className="w-full rounded-full px-4 py-2 text-sm border border-[var(--mocha-light)] focus:border-[var(--cacao)] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-[var(--cacao)] px-5 py-2.5 text-sm font-medium text-[var(--ivoire)] hover:bg-[var(--mocha)] transition-colors disabled:opacity-60"
      >
        {isPending ? "Redirection vers le paiement…" : `Acheter — ${priceLabel}`}
      </button>
      {!state.ok && state.message && <p className="text-xs text-red-700">{state.message}</p>}
    </form>
  );
}
