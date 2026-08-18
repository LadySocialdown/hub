import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { pushPreinscriptionToSystemeIo } from "@/lib/systemeio";
import { grantFormationAccess } from "@/lib/formation/grant";

const SYSTEME_IO_TAG_NAME = "Préinscrite Petite Académie";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function precommandeConfirmationEmailHtml(prenom: string): string {
  return `
    <div style="font-family: sans-serif; color: #1A1410; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 20px; color: #5A3E36;">Salut ${prenom} !</p>
      <p>C'est confirmé : ton paiement de <strong>497€</strong> a bien été reçu, ta place est réservée pour
      <strong>La Petite Académie</strong>.</p>
      <ul>
        <li>Accès complet à partir du <strong>21 septembre 2026</strong></li>
        <li>Module complémentaire « Les bases du marketing à connaître avant de commencer » offert</li>
      </ul>
      <p>Conformément à la loi, tu disposes d'un <strong>droit de rétractation de 14 jours</strong> à compter
      de ton paiement. Pour l'exercer, il te suffit de répondre à cet email.</p>
      <p>À très vite,<br />Sania — Lady Socialdown</p>
    </div>
  `;
}

async function handlePrecommandeAcademie(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") return;

  const email = (session.metadata?.email ?? session.customer_details?.email ?? "").toLowerCase();
  const prenom = session.metadata?.prenom ?? "";
  if (!email) return;

  const { data: existing } = await supabase
    .from("precommandes_academie")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return; // déjà traité (retry webhook Stripe)

  const { error } = await supabase.from("precommandes_academie").insert({
    prenom,
    email,
    montant: (session.amount_total ?? 49700) / 100,
    stripe_session_id: session.id,
  });

  if (error) {
    console.error("[precommande] échec de l'enregistrement Supabase", error);
    return;
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Lady Socialdown <hello@ladysocialdown.com>",
        to: email,
        subject: "Ta place est réservée pour La Petite Académie",
        html: precommandeConfirmationEmailHtml(prenom),
      });
    } catch (error) {
      console.error("[precommande] échec de l'email de confirmation", error);
    }
  }

  if (process.env.SYSTEME_IO_API_KEY) {
    try {
      await pushPreinscriptionToSystemeIo(email, prenom, SYSTEME_IO_TAG_NAME);
    } catch (error) {
      console.error("[precommande] échec de la synchro Systeme.io", error);
    }
  }

  try {
    await grantFormationAccess({ email, courseSlug: "petite-academie", grantedBy: "stripe" });
  } catch (error) {
    console.error("[precommande] échec de l'octroi d'accès à l'espace formation", error);
  }
}

function resourceDeliveryEmailHtml(nom: string, resourceTitle: string, driveUrl: string): string {
  return `
    <div style="font-family: sans-serif; color: #1A1410; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 20px; color: #5A3E36;">Merci ${nom} !</p>
      <p>Ton paiement pour <strong>${resourceTitle}</strong> a bien été reçu. Tu peux la télécharger dès
      maintenant :</p>
      <p style="margin: 24px 0;">
        <a href="${driveUrl}" style="display: inline-block; padding: 12px 24px; background: #5A3E36; color: #FFFEF8; text-decoration: none; border-radius: 999px; font-weight: 600;">
          Télécharger ${resourceTitle}
        </a>
      </p>
      <p style="font-size: 13px; opacity: 0.7;">Garde ce lien précieusement, il n'est envoyé que par cet email.</p>
      <p>À très vite,<br />Sania — Lady Socialdown</p>
    </div>
  `;
}

async function handleResourceAchat(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") return;

  const resourceId = session.metadata?.resource_id;
  const nom = session.metadata?.nom ?? "";
  const email = (session.metadata?.email ?? session.customer_details?.email ?? "").toLowerCase();
  if (!resourceId || !email) return;

  const { data: existing } = await supabase
    .from("resource_purchases")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) return; // déjà traité (retry webhook Stripe)

  const { data: resource } = await supabase
    .from("resources")
    .select("title, content_url")
    .eq("id", resourceId)
    .maybeSingle();
  if (!resource?.content_url) {
    console.error(`[ressources] achat de ${resourceId} sans content_url, email non envoyé`);
    return;
  }

  const { error } = await supabase.from("resource_purchases").insert({
    resource_id: resourceId,
    nom,
    email,
    montant: session.amount_total ?? 0,
    stripe_session_id: session.id,
  });
  if (error) {
    console.error("[ressources] échec de l'enregistrement Supabase", error);
    return;
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Lady Socialdown <hello@ladysocialdown.com>",
        to: email,
        subject: `Ta ressource "${resource.title}" est prête`,
        html: resourceDeliveryEmailHtml(nom, resource.title, resource.content_url),
      });
    } catch (error) {
      console.error("[ressources] échec de l'email de livraison", error);
    }
  }
}

function getPlanMap(): Record<string, "starter" | "essentielle" | "vip"> {
  return {
    [process.env.STRIPE_PRICE_ESSENTIELLE_MONTHLY ?? ""]: "essentielle",
    [process.env.STRIPE_PRICE_ESSENTIELLE_ANNUAL ?? ""]: "essentielle",
    [process.env.STRIPE_PRICE_VIP_MONTHLY ?? ""]: "vip",
    [process.env.STRIPE_PRICE_VIP_ANNUAL ?? ""]: "vip",
  };
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const PLAN_MAP = getPlanMap();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.type === "academie_precommande") {
        await handlePrecommandeAcademie(supabase, session);
        break;
      }

      if (session.metadata?.type === "resource_achat") {
        await handleResourceAchat(supabase, session);
        break;
      }

      const userId = session.metadata?.clerk_user_id;
      if (!userId) break;

      if (session.mode === "subscription") {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id;
        const plan = PLAN_MAP[priceId] ?? "essentielle";

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          plan,
          stripe_sub_id: sub.id,
          status: sub.status as "active" | "past_due" | "canceled" | "trialing",
          period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        }, { onConflict: "stripe_sub_id" });

        await supabase.from("users").update({ subscription_status: "active" }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status as "active" | "past_due" | "canceled" | "trialing";

      await supabase.from("subscriptions")
        .update({
          status,
          period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        })
        .eq("stripe_sub_id", sub.id);
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const userId = pi.metadata?.clerk_user_id;
      const itemType = pi.metadata?.item_type;
      const itemId = pi.metadata?.item_id;

      if (userId && itemType && itemId) {
        await supabase.from("purchases").insert({
          user_id: userId,
          item_type: itemType,
          item_id: itemId,
          stripe_payment_id: pi.id,
          amount: pi.amount,
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const planId = pi.metadata?.installment_plan_id;
      if (planId) {
        await supabase.from("installment_plans").update({ status: "failed" }).eq("id", planId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
