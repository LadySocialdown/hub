"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { runManualAnalysis } from "@/lib/instagram/scheduler";

export async function triggerManualAnalysisAction(): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();

  try {
    await runManualAnalysis();
    revalidatePath("/admin/instagram");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { ok: false, message };
  }
}
