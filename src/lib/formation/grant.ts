import { clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GrantedBy } from "@/types/supabase";
import { APP_ORIGIN, type FormationCourseSlug } from "./constants";
import { sendFormationAccessReadyEmail, sendFormationInvitationEmail } from "./emails";

/**
 * Octroie l'accès à une formation à partir d'un email :
 * - si un compte Clerk existe déjà pour cet email, l'accès est immédiat (course_enrollments)
 *   et l'élève reçoit un lien direct vers son espace ;
 * - sinon, une invitation Clerk est créée (email pré-rempli à la création de compte) et
 *   l'accès sera finalisé automatiquement par le webhook Clerk quand le compte sera créé.
 */
export async function grantFormationAccess(params: {
  email: string;
  courseSlug: FormationCourseSlug;
  grantedBy: GrantedBy;
}): Promise<void> {
  const email = params.email.trim().toLowerCase();
  const { courseSlug, grantedBy } = params;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Variable d'environnement manquante : RESEND_API_KEY");
  }

  const supabase = createServerSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseSlug)
    .single();
  if (courseError || !course) {
    throw new Error(`Formation introuvable pour le slug "${courseSlug}"`);
  }

  const client = await clerkClient();
  const { data: existingUsers } = await client.users.getUserList({ emailAddress: [email] });
  const existingUser = existingUsers[0];

  if (existingUser) {
    // `public.users` n'est peuplée que par le webhook Clerk : un compte créé avant sa mise
    // en place (ou une synchro manquée) peut exister côté Clerk sans exister ici. On se
    // resynchronise nous-mêmes pour ne pas dépendre de l'ordre d'exécution du webhook.
    const name = [existingUser.firstName, existingUser.lastName].filter(Boolean).join(" ") || null;
    const { error: userSyncError } = await supabase
      .from("users")
      .upsert({ id: existingUser.id, email, name }, { onConflict: "id" });
    if (userSyncError) throw userSyncError;

    const { error } = await supabase
      .from("course_enrollments")
      .upsert(
        { user_id: existingUser.id, course_id: course.id, granted_by: grantedBy },
        { onConflict: "user_id,course_id" }
      );
    if (error) throw error;

    await sendFormationAccessReadyEmail({
      to: email,
      courseTitle: course.title,
      dashboardUrl: `${APP_ORIGIN}/dashboard/formation/${course.slug}`,
    });
    return;
  }

  const invitation = await client.invitations.createInvitation({
    emailAddress: email,
    notify: false,
    ignoreExisting: true,
    publicMetadata: { pendingCourseSlug: course.slug },
    redirectUrl: `${APP_ORIGIN}/dashboard/formation/${course.slug}`,
  });

  const { error } = await supabase.from("formation_invitations").insert({
    email,
    course_id: course.id,
    clerk_invitation_id: invitation.id,
    granted_by: grantedBy,
  });
  if (error) throw error;

  await sendFormationInvitationEmail({
    to: email,
    courseTitle: course.title,
    invitationUrl: invitation.url ?? `${APP_ORIGIN}/inscription`,
  });
}
