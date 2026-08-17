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
    public_metadata?: { pendingCourseSlug?: string };
  };
};

/**
 * Finalise l'accès formation d'une élève invitée : le slug de la formation voyage dans
 * publicMetadata de l'invitation Clerk et se retrouve automatiquement sur l'utilisateur
 * créé (comportement natif Clerk). On active l'accès et on solde l'invitation en attente.
 */
async function finalizeFormationAccess(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  email: string,
  pendingCourseSlug: string
) {
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", pendingCourseSlug)
    .maybeSingle();
  if (!course) return;

  const { data: invitation } = await supabase
    .from("formation_invitations")
    .select("id, granted_by")
    .eq("email", email.toLowerCase())
    .eq("course_id", course.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("course_enrollments").upsert(
    { user_id: userId, course_id: course.id, granted_by: invitation?.granted_by ?? "admin" },
    { onConflict: "user_id,course_id" }
  );

  if (invitation) {
    await supabase
      .from("formation_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);
  }
}

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

    const pendingCourseSlug = event.data.public_metadata?.pendingCourseSlug;
    if (event.type === "user.created" && pendingCourseSlug) {
      await finalizeFormationAccess(supabase, id, primaryEmail, pendingCourseSlug);
    }
  }

  if (event.type === "user.deleted") {
    await supabase.from("users").delete().eq("id", event.data.id);
  }

  return NextResponse.json({ received: true });
}
