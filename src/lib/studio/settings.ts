import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_PILLARS } from "@/lib/studio/constants";
import type { StudioSettings } from "@/types/studio";

export function defaultSettings(userId: string): StudioSettings {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    activity: "",
    audience: "",
    handle: "",
    tone: "",
    logo_url: null,
    show_logo_on_cover: true,
    colors: { principale: "#2F4A3A", accent: "#E9B8B0", fond: "#FBF7F0", detail: "#8E4E45" },
    font_title: "Cormorant Garamond",
    font_body: "DM Sans",
    custom_fonts: [],
    default_style: "doux",
    reference_style: null,
    pillars: DEFAULT_PILLARS,
    networks: ["Instagram"],
    posts_per_week: 5,
    preferred_time: "18:00",
    updated_at: now,
    created_at: now,
  };
}

export async function getSettings(userId: string): Promise<StudioSettings | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("studio_settings").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as StudioSettings | null) ?? null;
}
