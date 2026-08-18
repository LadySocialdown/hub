"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ModuleResource } from "@/types/formation";

export async function updateModuleContentAction(
  moduleId: string,
  youtubeVideoId: string,
  resources: ModuleResource[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  const trimmedVideoId = youtubeVideoId.trim();
  const cleanResources = resources
    .map((r) => ({ title: r.title.trim(), url: r.url.trim() }))
    .filter((r) => r.title && r.url);

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("modules")
    .update({
      youtube_video_id: trimmedVideoId || null,
      resources: cleanResources,
    })
    .eq("id", moduleId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/contenus");
  return { ok: true };
}
