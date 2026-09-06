"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ModuleResource } from "@/types/formation";

export interface LessonInput {
  id?: string;
  title: string;
  youtube_video_id: string;
}

export async function updateModuleContentAction(
  moduleId: string,
  lessons: LessonInput[],
  resources: ModuleResource[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const supabase = createServerSupabaseClient();

  const cleanLessons = lessons
    .map((l, i) => ({
      id: l.id,
      title: l.title.trim(),
      youtube_video_id: l.youtube_video_id.trim() || null,
      position: i + 1,
    }))
    .filter((l) => l.title);

  const { data: existing, error: existingError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleId);
  if (existingError) return { ok: false, message: existingError.message };

  const keepIds = new Set(cleanLessons.filter((l) => l.id).map((l) => l.id));
  const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    const { error } = await supabase.from("lessons").delete().in("id", toDelete);
    if (error) return { ok: false, message: error.message };
  }

  for (const lesson of cleanLessons) {
    const fields = {
      title: lesson.title,
      position: lesson.position,
      youtube_video_id: lesson.youtube_video_id,
    };
    const { error } = lesson.id
      ? await supabase.from("lessons").update(fields).eq("id", lesson.id)
      : await supabase.from("lessons").insert({ ...fields, module_id: moduleId });
    if (error) return { ok: false, message: error.message };
  }

  const cleanResources = resources
    .map((r) => ({ title: r.title.trim(), url: r.url.trim() }))
    .filter((r) => r.title && r.url);

  const { error: resourcesError } = await supabase
    .from("modules")
    .update({ resources: cleanResources })
    .eq("id", moduleId);
  if (resourcesError) return { ok: false, message: resourcesError.message };

  revalidatePath("/admin/contenus");
  return { ok: true };
}
