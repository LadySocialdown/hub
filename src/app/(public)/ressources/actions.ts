"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_ORIGIN = "https://app.ladysocialdown.com";

export interface ResourceCheckoutState {
  ok: boolean;
  message: string;
}

export async function createResourceCheckout(
  _prevState: ResourceCheckoutState | null,
  formData: FormData
): Promise<ResourceCheckoutState> {
  const resourceId = String(formData.get("resourceId") ?? "");
  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!nom || !email) {
    return { ok: false, message: "Merci de renseigner ton nom et ton email." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, message: "Cet email ne semble pas valide." };
  }

  const supabase = createServerSupabaseClient();
  const { data: resource } = await supabase
    .from("resources")
    .select("id, title, price, is_free")
    .eq("id", resourceId)
    .maybeSingle();

  if (!resource || resource.is_free || !resource.price) {
    return { ok: false, message: "Cette ressource n'est pas disponible à l'achat." };
  }

  const origin = (await headers()).get("origin") ?? FALLBACK_ORIGIN;

  let checkoutUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: resource.title },
            unit_amount: resource.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/ressources?achat=confirme`,
      cancel_url: `${origin}/ressources`,
      metadata: {
        type: "resource_achat",
        resource_id: resource.id,
        nom,
        email,
      },
    });
    checkoutUrl = session.url;
  } catch (error) {
    console.error("[ressources] échec de la création de la session Stripe", error);
    return { ok: false, message: "Une erreur est survenue, réessaie dans un instant." };
  }

  if (!checkoutUrl) {
    return { ok: false, message: "Une erreur est survenue, réessaie dans un instant." };
  }

  redirect(checkoutUrl);
}
