"use client";

import { useState } from "react";
import type { FormationCourse } from "@/types/formation";
import { ModuleEditor } from "./ModuleEditor";
import { ResourcesManager, type ResourceItem } from "./ResourcesManager";

type Tab = "modules" | "ressources";

export function ContenusManager({
  courses,
  resources,
}: {
  courses: FormationCourse[];
  resources: ResourceItem[];
}) {
  const [tab, setTab] = useState<Tab>("modules");
  const [selectedSlug, setSelectedSlug] = useState(courses[0]?.slug ?? "");
  const selectedCourse = courses.find((c) => c.slug === selectedSlug) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--mocha-light)]">
        {(
          [
            { key: "modules" as const, label: "Modules de formation" },
            { key: "ressources" as const, label: "Ressources" },
          ]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[var(--cacao)] text-[var(--cacao)]"
                : "border-transparent text-[var(--noir)] opacity-60 hover:opacity-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "modules" && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[var(--mocha)] mb-1.5">
              Formation à alimenter
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="rounded-full border border-[var(--mocha-light)] px-4 py-2.5 text-sm focus:border-[var(--cacao)] focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="space-y-4">
              {selectedCourse.modules.map((m) => (
                <ModuleEditor key={m.id} module={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "ressources" && <ResourcesManager resources={resources} />}
    </div>
  );
}
