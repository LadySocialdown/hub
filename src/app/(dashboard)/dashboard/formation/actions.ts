"use server";

import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Marque un module comme terminé — appelé automatiquement à la fin de la vidéo, jamais manuellement. */
export async function markModuleCompleteAction(moduleId: string): Promise<{ ok: boolean }> {
  const { userId } = await requireAuth();
  const supabase = createServerSupabaseClient();

  const { data: courseModule } = await supabase
    .from("modules")
    .select("id, course_id")
    .eq("id", moduleId)
    .maybeSingle();
  if (!courseModule) return { ok: false };

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseModule.course_id)
    .maybeSingle();
  if (!enrollment) return { ok: false };

  const { error } = await supabase.from("user_progress").upsert(
    { user_id: userId, module_id: moduleId, completed: true, completed_at: new Date().toISOString() },
    { onConflict: "user_id,module_id" }
  );

  return { ok: !error };
}
