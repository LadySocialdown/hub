"use server";

import { requireAdmin } from "@/lib/auth";
import { grantFormationAccess } from "@/lib/formation/grant";
import { EMAIL_REGEX, MANUAL_GRANT_COURSE_SLUGS, type FormationCourseSlug } from "@/lib/formation/constants";

export async function grantManualFormationAccessAction(
  email: string,
  courseSlug: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { ok: false, message: "Cet email ne semble pas valide." };
  }
  if (!MANUAL_GRANT_COURSE_SLUGS.includes(courseSlug as FormationCourseSlug)) {
    return { ok: false, message: "Formation invalide." };
  }

  try {
    await grantFormationAccess({
      email: trimmedEmail,
      courseSlug: courseSlug as FormationCourseSlug,
      grantedBy: "admin",
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { ok: false, message };
  }
}
