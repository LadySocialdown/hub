import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import fs from "node:fs";
import path from "node:path";
import type { RessourceContent } from "@/types/ressource";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import RessourceEngine from "@/components/ressource/RessourceEngine";

export const dynamic = "force-dynamic";

function loadContent(id: string): RessourceContent | null {
  try {
    const filePath = path.join(process.cwd(), "content", "ressources", `${id}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as RessourceContent;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = loadContent(id);
  if (!content) return { title: "Ressource introuvable" };
  return { title: `${content.title} · La Petite Académie` };
}

export default async function RessourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = loadContent(id);
  if (!content) notFound();

  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServerSupabaseClient();
  const { data: attempt } = await supabase
    .from("resource_attempts")
    .select("id, answers, current_step, completed_at")
    .eq("user_id", userId)
    .eq("resource_id", id)
    .order("attempt", { ascending: false })
    .limit(1)
    .maybeSingle();

  const resourceRoute = `/dashboard/formation/ressources/${id}`;

  return (
    <RessourceEngine
      content={content}
      initialAttempt={attempt ?? null}
      resourceRoute={resourceRoute}
    />
  );
}
