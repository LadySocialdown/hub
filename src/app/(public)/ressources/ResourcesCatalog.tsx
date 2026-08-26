"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Lock } from "lucide-react";
import type { ResourceType } from "@/types/supabase";
import { ResourcePurchaseForm } from "./ResourcePurchaseForm";

export interface CatalogResource {
  id: string;
  title: string;
  type: ResourceType;
  description: string | null;
  is_free: boolean;
  price: number | null;
  content_url: string | null;
}

const CATEGORIES: Array<{ key: string; label: string; types: ResourceType[] }> = [
  { key: "pdf", label: "Guides PDF", types: ["pdf"] },
  { key: "template", label: "Templates", types: ["template"] },
  { key: "video", label: "Replays de lives", types: ["video"] },
  { key: "article", label: "Articles", types: ["article"] },
  { key: "payant", label: "Ebooks & outils", types: ["ebook", "outil"] },
];

function formatPrice(price: number): string {
  return `${(price / 100).toFixed(2).replace(".00", "")}€`;
}

export function ResourcesCatalog({
  resources,
  isLoggedIn,
}: {
  resources: CatalogResource[];
  isLoggedIn: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const active = CATEGORIES.find((c) => c.key === activeCategory) ?? CATEGORIES[0];
  const items = resources.filter((r) => active.types.includes(r.type));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === c.key
                ? "bg-[var(--cacao)] text-[var(--ivoire)] border-[var(--cacao)]"
                : "bg-white text-[var(--cacao)] border-[var(--mocha-light)] hover:bg-[var(--sable)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-[var(--noir)] opacity-40 text-sm">
          Bientôt disponible.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((r) => (
            <div
              key={r.id}
              className="card-lift bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="space-y-1.5">
                <h2
                  className="text-lg font-semibold text-[var(--cacao)]"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  {r.title}
                </h2>
                {r.description && (
                  <p className="text-sm text-[var(--noir)] opacity-70 leading-relaxed">
                    {r.description}
                  </p>
                )}
              </div>

              {r.is_free ? (
                isLoggedIn ? (
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
    </div>
  );
}
