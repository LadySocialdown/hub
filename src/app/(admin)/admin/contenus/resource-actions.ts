"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ResourceType } from "@/types/supabase";

export interface ResourceInput {
  title: string;
  type: ResourceType;
  description: string;
  is_free: boolean;
  price: number | null; // centimes
  content_url: string;
  tags: string[];
}

function validate(input: ResourceInput): string | null {
  if (!input.title.trim()) return "Le titre est requis.";
  if (!input.is_free && (!input.price || input.price <= 0)) {
    return "Un prix est requis pour une ressource payante.";
  }
  return null;
}

export async function createResourceAction(
  input: ResourceInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  const error = validate(input);
  if (error) return { ok: false, message: error };

  const supabase = createServerSupabaseClient();
  const { error: dbError } = await supabase.from("resources").insert({
    title: input.title.trim(),
    type: input.type,
    description: input.description.trim() || null,
    is_free: input.is_free,
    price: input.is_free ? null : input.price,
    content_url: input.content_url.trim() || null,
    tags: input.tags,
  });

  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/admin/contenus");
  return { ok: true };
}

export async function updateResourceAction(
  id: string,
  input: ResourceInput
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  const error = validate(input);
  if (error) return { ok: false, message: error };

  const supabase = createServerSupabaseClient();
  const { error: dbError } = await supabase
    .from("resources")
    .update({
      title: input.title.trim(),
      type: input.type,
      description: input.description.trim() || null,
      is_free: input.is_free,
      price: input.is_free ? null : input.price,
      content_url: input.content_url.trim() || null,
      tags: input.tags,
    })
    .eq("id", id);

  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/admin/contenus");
  revalidatePath("/ressources");
  return { ok: true };
}

export async function deleteResourceAction(
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/contenus");
  revalidatePath("/ressources");
  return { ok: true };
}
