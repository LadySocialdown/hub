import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ModuleResource, FormationCourse } from "@/types/formation";

/** Formations (slug + titre) auxquelles l'élève a accès. Normalement une seule. */
export async function getEnrolledCourses(
  userId: string
): Promise<Array<{ slug: string; title: string }>> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("course_enrollments")
    .select("courses(slug, title)")
    .eq("user_id", userId);

  const rows = (data ?? []) as unknown as Array<{
    courses: { slug: string; title: string } | null;
  }>;

  return rows.map((row) => row.courses).filter((c): c is { slug: string; title: string } => c !== null);
}

/** Formation + modules + progression de l'élève, uniquement si elle y a accès. */
export async function getCourseWithProgress(
  userId: string,
  slug: string
): Promise<FormationCourse | null> {
  const supabase = createServerSupabaseClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", slug)
    .maybeSingle();
  if (!course) return null;

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();
  if (!enrollment) return null;

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, position, youtube_video_id, resources")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  const { data: progress } = await supabase
    .from("user_progress")
    .select("module_id, completed")
    .eq("user_id", userId);

  const completedModuleIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.module_id)
  );

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    modules: (modules ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      position: m.position,
      youtube_video_id: m.youtube_video_id,
      resources: (m.resources as unknown as ModuleResource[] | null) ?? [],
      completed: completedModuleIds.has(m.id),
    })),
  };
}
