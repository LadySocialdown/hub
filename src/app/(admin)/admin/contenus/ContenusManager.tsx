"use client";

import { useState } from "react";
import type { FormationCourse } from "@/types/formation";
import { ModuleEditor } from "./ModuleEditor";

export function ContenusManager({ courses }: { courses: FormationCourse[] }) {
  const [selectedSlug, setSelectedSlug] = useState(courses[0]?.slug ?? "");
  const selectedCourse = courses.find((c) => c.slug === selectedSlug) ?? null;

  return (
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
  );
}
