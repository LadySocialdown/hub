import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripe;
}

const PRECOMMANDE_ACADEMIE_LOOKUP_KEY = "academie_precommande_497";

/**
 * Retrouve le prix Stripe de la précommande La Petite Académie (497€, paiement
 * unique) via son lookup_key, ou crée le produit + prix s'ils n'existent pas
 * encore. Idempotent : ne recrée jamais de doublon.
 */
export async function getOrCreatePrecommandeAcademiePrice(): Promise<string> {
  const client = getStripe();

  const existing = await client.prices.list({
    lookup_keys: [PRECOMMANDE_ACADEMIE_LOOKUP_KEY],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const product = await client.products.create({
    name: "La Petite Académie — Précommande",
    description:
      "Précommande au tarif de lancement (497€ au lieu de 597€), accès à partir du 21 septembre 2026.",
  });

  const price = await client.prices.create({
    product: product.id,
    unit_amount: 49700,
    currency: "eur",
    lookup_key: PRECOMMANDE_ACADEMIE_LOOKUP_KEY,
  });

  return price.id;
}
