import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
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
