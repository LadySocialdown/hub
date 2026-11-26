import "server-only";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getPublication, isoDate, listPublications, monthObjectiveCounts } from "@/lib/studio/publications";
import { getSettings } from "@/lib/studio/settings";

/** Données communes des écrans de création (carrousel, story). */
export async function loadEditor(id: string, format: "carrousel" | "story") {
  const { userId } = await auth();
  if (!userId) redirect("/connexion");
  const settings = await getSettings(userId);
  if (!settings) redirect("/dashboard/studio/reglages");
  const pub = await getPublication(userId, id);
  if (!pub) notFound();
  if (pub.format !== format) redirect(`/dashboard/studio/${pub.format === "reel" ? "" : pub.format + "/" + pub.id}`);
  const counts = await monthObjectiveCounts(userId, pub.scheduled_date);
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const remaining = (await listPublications(userId, isoDate(now), isoDate(monthEnd))).filter((p) => p.status === "a_creer" && p.format !== "reel").length;
  return {
    pub,
    settings,
    objectiveCounts: counts,
    remainingPlanned: remaining,
    imageGeneration: !!process.env.STUDIO_IMAGE_PROVIDER,
  };
}
