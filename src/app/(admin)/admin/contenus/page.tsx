import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { getAllCoursesWithModules } from "@/lib/formation/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenusManager } from "./ContenusManager";

export const metadata: Metadata = { title: "Contenus — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminContenusPage() {
  await requireAdminPage();
  const courses = await getAllCoursesWithModules();

  const supabase = createServerSupabaseClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, type, description, is_free, price, content_url, tags")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace formation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Contenus
        </h1>
        <p className="text-sm text-[var(--noir)] opacity-60 mt-1">
          Vidéos et ressources des modules, et catalogue de ressources gratuites/payantes.
        </p>
      </div>

      <ContenusManager courses={courses} resources={resources ?? []} />
    </div>
  );
}
