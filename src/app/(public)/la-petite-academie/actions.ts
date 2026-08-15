"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe, getOrCreatePrecommandeAcademiePrice } from "@/lib/stripe";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_ORIGIN = "https://app.ladysocialdown.com";

export interface PrecommandeState {
  ok: boolean;
  message: string;
}

export async function createPrecommandeCheckout(
  _prevState: PrecommandeState | null,
  formData: FormData
): Promise<PrecommandeState> {
  const prenom = String(formData.get("prenom") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!prenom || !email) {
    return { ok: false, message: "Merci de renseigner ton prénom et ton email." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, message: "Cet email ne semble pas valide." };
  }

  const origin = (await headers()).get("origin") ?? FALLBACK_ORIGIN;

  let checkoutUrl: string | null;
  try {
    const stripe = getStripe();
    const priceId = await getOrCreatePrecommandeAcademiePrice();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/la-petite-academie/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/la-petite-academie`,
      metadata: {
        type: "academie_precommande",
        prenom,
        email,
      },
    });
    checkoutUrl = session.url;
  } catch (error) {
    console.error("[precommande] échec de la création de la session Stripe", error);
    return { ok: false, message: "Une erreur est survenue, réessaie dans un instant." };
  }

  if (!checkoutUrl) {
    return { ok: false, message: "Une erreur est survenue, réessaie dans un instant." };
  }

  redirect(checkoutUrl);
}
