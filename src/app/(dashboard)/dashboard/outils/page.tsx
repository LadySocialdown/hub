import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSubscriptionPlan } from "@/lib/auth";
import OutilsGrid from "./OutilsGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mes outils" };

export default async function OutilsPage() {
  const supabase = createServerSupabaseClient();
  const { data: tools } = await supabase
    .from("tools")
    .select("id, title, type, url, is_premium, tags")
    .order("title", { ascending: true });

  const plan = await getSubscriptionPlan();
  const hasPremiumAccess = plan === "essentielle" || plan === "vip";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace outils
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Mes outils
        </h1>
        <p className="mt-2 text-sm text-[var(--noir)] opacity-60">
          Templates, guides et vidéos pour accélérer ta présence en ligne.
        </p>
      </div>

      <OutilsGrid tools={tools ?? []} hasPremiumAccess={hasPremiumAccess} />
    </div>
  );
}
