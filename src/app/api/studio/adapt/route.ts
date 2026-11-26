import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OBJECTIVES } from "@/lib/studio/constants";
import { GenerationError, adaptToObjective } from "@/lib/studio/generate";
import { getPublication } from "@/lib/studio/publications";
import { getSettings } from "@/lib/studio/settings";

export const maxDuration = 60;

// Propose une accroche et un appel à l'action adaptés au nouvel objectif (jamais automatique).
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, objective } = (await req.json()) as { id: string; objective: string };
  if (!(OBJECTIVES as readonly string[]).includes(objective)) return NextResponse.json({ error: "Objectif inconnu." }, { status: 400 });
  const pub = await getPublication(userId, id);
  const settings = await getSettings(userId);
  if (!pub || !settings) return NextResponse.json({ error: "Contenu introuvable." }, { status: 404 });
  try {
    return NextResponse.json(await adaptToObjective(pub, settings, objective));
  } catch (e) {
    const message = e instanceof GenerationError ? e.message : "L'adaptation n'a pas abouti.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
