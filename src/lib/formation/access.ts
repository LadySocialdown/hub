import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ModuleResource, FormationCourse, FormationModule } from "@/types/formation";

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

/** Modules d'une formation avec leurs leçons (vidéos), et la progression fournie. */
async function loadModulesWithLessons(
  courseId: string,
  completedLessonIds: Set<string>
): Promise<FormationModule[]> {
  const supabase = createServerSupabaseClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, position, resources")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } =
    moduleIds.length > 0
      ? await supabase
          .from("lessons")
          .select("id, module_id, title, position, youtube_video_id")
          .in("module_id", moduleIds)
          .order("position", { ascending: true })
      : { data: [] };

  return (modules ?? []).map((m) => {
    const moduleLessons = (lessons ?? [])
      .filter((l) => l.module_id === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        position: l.position,
        youtube_video_id: l.youtube_video_id,
        completed: completedLessonIds.has(l.id),
      }));

    return {
      id: m.id,
      title: m.title,
      position: m.position,
      lessons: moduleLessons,
      resources: (m.resources as unknown as ModuleResource[] | null) ?? [],
      completed: moduleLessons.length > 0 && moduleLessons.every((l) => l.completed),
    };
  });
}

/** Formation + modules/leçons + progression de l'élève, uniquement si elle y a accès. */
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

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", userId);

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id)
  );

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    modules: await loadModulesWithLessons(course.id, completedLessonIds),
  };
}

/** Les 3 formations et tous leurs modules/leçons, sans vérification d'accès — usage admin uniquement. */
export async function getAllCoursesWithModules(): Promise<FormationCourse[]> {
  const supabase = createServerSupabaseClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title")
    .order("slug", { ascending: true });

  const result: FormationCourse[] = [];
  for (const course of courses ?? []) {
    result.push({
      id: course.id,
      slug: course.slug,
      title: course.title,
      modules: await loadModulesWithLessons(course.id, new Set()),
    });
  }
  return result;
}
