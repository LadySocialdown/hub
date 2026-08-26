import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResourcesCatalog } from "./ResourcesCatalog";

export const metadata: Metadata = {
  title: "Ressources gratuites",
  description: "Guides PDF, templates, replays et articles — tout le contenu de Lady Socialdown.",
};
export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  const { userId } = await auth();
  const supabase = createServerSupabaseClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, type, description, is_free, price, content_url")
    .order("created_at", { ascending: false });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]">Accès libre</p>
        <h1
          className="text-4xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Ressources
        </h1>
        <p className="text-[var(--noir)] opacity-70 max-w-xl">
          Guides pratiques, templates et outils pour développer ta présence en ligne. Les ressources
          gratuites sont accessibles à toute élève connectée ; les ressources payantes s&apos;achètent
          directement, sans compte requis.
        </p>
      </div>

      <ResourcesCatalog resources={resources ?? []} isLoggedIn={!!userId} />
    </section>
  );
}
