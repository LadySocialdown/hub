import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get("resourceId");
  const attempt = parseInt(searchParams.get("attempt") ?? "1", 10);

  if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("resource_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .eq("attempt", attempt)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? null);
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    resourceId,
    resourceVersion,
    answers,
    currentStep,
    computed,
    completedAt,
    attemptId,
  } = body as {
    resourceId: string;
    resourceVersion: number;
    answers: Record<string, unknown>;
    currentStep: string;
    computed?: Record<string, unknown>;
    completedAt?: string;
    attemptId?: string;
  };

  if (!resourceId) return NextResponse.json({ error: "resourceId required" }, { status: 400 });

  const supabase = createServerSupabaseClient();

  // Find the current max attempt to know which one to update
  const { data: existing } = await supabase
    .from("resource_attempts")
    .select("id, attempt")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .order("attempt", { ascending: false })
    .limit(1)
    .maybeSingle();

  let data, error;
  if (existing) {
    const updatePayload = {
      answers: answers as import("@/types/ressource").Answers,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
      ...(computed ? { computed: computed as Record<string, Record<string, number | null>> } : {}),
      ...(completedAt ? { completed_at: completedAt } : {}),
    };
    ({ data, error } = await supabase
      .from("resource_attempts")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("id")
      .single());
  } else {
    const insertPayload = {
      user_id: userId,
      resource_id: resourceId,
      resource_version: resourceVersion ?? 1,
      attempt: 1,
      answers: answers as import("@/types/ressource").Answers,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
      ...(computed ? { computed: computed as Record<string, Record<string, number | null>> } : {}),
      ...(completedAt ? { completed_at: completedAt } : {}),
    };
    ({ data, error } = await supabase
      .from("resource_attempts")
      .insert(insertPayload)
      .select("id")
      .single());
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
