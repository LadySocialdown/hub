"use server";

import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Marque une leçon comme terminée — appelé automatiquement à la fin de la vidéo, jamais manuellement. */
export async function markLessonCompleteAction(lessonId: string): Promise<{ ok: boolean }> {
  const { userId } = await requireAuth();
  const supabase = createServerSupabaseClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, modules(course_id)")
    .eq("id", lessonId)
    .maybeSingle();
  const courseId = (lesson as unknown as { modules: { course_id: string } | null } | null)?.modules
    ?.course_id;
  if (!courseId) return { ok: false };

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) return { ok: false };

  const { error } = await supabase.from("lesson_progress").upsert(
    { user_id: userId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_id" }
  );

  return { ok: !error };
}
