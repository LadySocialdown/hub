import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET ?? "");
  let event: ClerkUserEvent;

  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data;
    const primaryEmail = email_addresses.find(
      (e) => e.id === primary_email_address_id
    )?.email_address;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No primary email" }, { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await supabase.from("users").upsert(
      { id, email: primaryEmail, name },
      { onConflict: "id" }
    );
  }

  if (event.type === "user.deleted") {
    await supabase.from("users").delete().eq("id", event.data.id);
  }

  return NextResponse.json({ received: true });
}
