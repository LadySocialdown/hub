import type { Metadata } from "next";
import Link from "next/link";
import { Download, Lock } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ResourcePurchaseForm } from "./ResourcePurchaseForm";

export const metadata: Metadata = {
  title: "Ressources gratuites",
  description: "Guides PDF, articles, replays — tout le contenu gratuit de Lady Socialdown.",
};
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  article: "Article",
  pdf: "PDF",
  video: "Vidéo",
  ebook: "Ebook",
  outil: "Outil",
};

function formatPrice(price: number): string {
  return `${(price / 100).toFixed(2).replace(".00", "")}€`;
}

export default async function RessourcesPage() {
  const { userId } = await auth();
  const supabase = createServerSupabaseClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, type, is_free, price, content_url, tags")
    .order("created_at", { ascending: false });

  const list = resources ?? [];

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
          Guides pratiques, ebooks et outils pour développer ta présence en ligne. Les ressources
          gratuites sont accessibles à toute élève connectée ; les ressources payantes s&apos;achètent
          directement, sans compte requis.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-[var(--noir)] opacity-40 text-sm">
          Contenu en cours d&apos;ajout.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((r) => (
            <div
              key={r.id}
              className="card-lift bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="space-y-1.5">
                <span className="inline-block text-xs uppercase tracking-wide font-medium text-[var(--mocha)]">
                  {TYPE_LABELS[r.type] ?? r.type}
                </span>
                <h2
                  className="text-lg font-semibold text-[var(--cacao)]"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {r.title}
                </h2>
              </div>

              {r.is_free ? (
                userId ? (
                  r.content_url ? (
                    <a
                      href={r.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[var(--cacao)] px-5 py-2.5 text-sm font-medium text-[var(--ivoire)] hover:bg-[var(--mocha)] transition-colors"
                    >
                      <Download size={16} />
                      Télécharger
                    </a>
                  ) : (
                    <p className="mt-auto text-xs text-[var(--noir)] opacity-50">Bientôt disponible.</p>
                  )
                ) : (
                  <Link
                    href="/connexion"
                    className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[var(--cacao)] px-5 py-2.5 text-sm font-medium text-[var(--cacao)] hover:bg-[var(--sable)] transition-colors"
                  >
                    <Lock size={16} />
                    Se connecter pour accéder
                  </Link>
                )
              ) : r.price ? (
                <div className="mt-auto">
                  <ResourcePurchaseForm resourceId={r.id} priceLabel={formatPrice(r.price)} />
                </div>
              ) : (
                <p className="mt-auto text-xs text-[var(--noir)] opacity-50">Bientôt disponible.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
