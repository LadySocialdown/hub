"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CPF_STATUT_OPTIONS } from "@/lib/students/list";

export async function updateCpfStatutAction(
  cpfStudentId: string,
  statut: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  if (!CPF_STATUT_OPTIONS.some((o) => o.value === statut)) {
    return { ok: false, message: "Statut invalide." };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("cpf_students")
    .update({ statut_dossier: statut })
    .eq("id", cpfStudentId);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/eleves");
  return { ok: true };
}
