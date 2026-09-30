"use client";

import { useState } from "react";
import type { ToolType } from "@/types/supabase";

type Tool = {
  id: string;
  title: string;
  type: ToolType;
  url: string;
  is_premium: boolean;
  tags: string[];
};

const TYPE_LABELS: Record<ToolType | "all", string> = {
  all: "Tous",
  template: "Templates",
  guide: "Guides",
  video: "Vidéos",
};

const TYPE_ICONS: Record<ToolType, string> = {
  template: "□",
  guide: "⊞",
  video: "▷",
};

export default function OutilsGrid({
  tools,
  hasPremiumAccess,
}: {
  tools: Tool[];
  hasPremiumAccess: boolean;
}) {
  const [filter, setFilter] = useState<ToolType | "all">("all");

  const visible = filter === "all" ? tools : tools.filter((t) => t.type === filter);
  const filters: (ToolType | "all")[] = ["all", "template", "guide", "video"];

  return (
    <div>
      <div className="flex gap-2 mb-8 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-[var(--cacao)] text-white border-[var(--cacao)]"
                : "border-[var(--mocha-light)] text-[var(--cacao)] hover:border-[var(--mocha)] hover:bg-[var(--sable)]"
            }`}
          >
            {TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-[var(--noir)] opacity-50 py-8 text-center">
          Aucun outil dans cette catégorie pour l'instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((tool) => {
            const locked = tool.is_premium && !hasPremiumAccess;
            return (
              <div
                key={tool.id}
                className={`bg-white border border-[var(--mocha-light)] rounded-2xl p-5 flex flex-col gap-3 ${
                  locked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-[var(--mocha)] uppercase tracking-wider">
                    {TYPE_ICONS[tool.type]} {tool.type}
                  </span>
                  {tool.is_premium && (
                    <span className="text-xs font-medium bg-[var(--mocha-light)] text-[var(--cacao)] px-2 py-0.5 rounded-full shrink-0">
                      Premium
                    </span>
                  )}
                </div>
                <p
                  className="font-semibold text-[var(--cacao)] leading-snug"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem" }}
                >
                  {tool.title}
                </p>
                {tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-[var(--noir)] opacity-50 bg-[var(--sable)] px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-2">
                  {locked ? (
                    <span className="text-xs text-[var(--mocha)] opacity-80">
                      🔒 Disponible à partir de l'offre Essentielle
                    </span>
                  ) : (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[var(--mocha)] hover:underline"
                    >
                      Accéder →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
