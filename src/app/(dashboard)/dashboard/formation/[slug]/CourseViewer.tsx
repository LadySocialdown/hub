"use client";

import { useCallback, useState, useTransition } from "react";
import { CheckCircle2, Circle, Download, Calendar } from "lucide-react";
import type { FormationCourse, FormationModule } from "@/types/formation";
import { YouTubePlayer } from "./YouTubePlayer";
import { markModuleCompleteAction } from "../actions";

export function CourseViewer({
  course,
  calendlyUrl,
}: {
  course: FormationCourse;
  calendlyUrl?: string;
}) {
  const [modules, setModules] = useState<FormationModule[]>(course.modules);
  const [activeId, setActiveId] = useState<string | null>(modules[0]?.id ?? null);
  const [, startTransition] = useTransition();

  const active = modules.find((m) => m.id === activeId) ?? null;
  const completedCount = modules.filter((m) => m.completed).length;
  const progressPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  const handleEnded = useCallback(() => {
    setModules((prev) => prev.map((m) => (m.id === activeId ? { ...m, completed: true } : m)));
    if (activeId) {
      startTransition(async () => {
        await markModuleCompleteAction(activeId);
      });
    }
  }, [activeId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-4 shadow-warm">
          <div className="flex items-center justify-between text-xs text-[var(--noir)] opacity-70 mb-2">
            <span>Progression</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--sable)] overflow-hidden">
            <div
              className="h-full bg-[var(--cacao)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <ul className="rounded-2xl border border-[var(--mocha-light)] bg-white shadow-warm divide-y divide-[var(--mocha-light)] overflow-hidden">
          {modules.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => setActiveId(m.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--sable)] ${
                  m.id === activeId ? "bg-[var(--sable)] text-[var(--cacao)] font-medium" : "text-[var(--noir)]"
                }`}
              >
                {m.completed ? (
                  <CheckCircle2 size={18} className="shrink-0 text-[var(--cacao)]" />
                ) : (
                  <Circle size={18} className="shrink-0 opacity-40" />
                )}
                <span>
                  {m.position}. {m.title}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {calendlyUrl && (
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--cacao)] px-5 py-2.5 text-sm font-medium text-[var(--ivoire)] hover:bg-[var(--mocha)] transition-colors"
          >
            <Calendar size={16} />
            Réserver ma session de coaching
          </a>
        )}
      </aside>

      <div className="space-y-6">
        {active ? (
          <>
            <h2
              className="text-xl font-semibold text-[var(--cacao)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {active.position}. {active.title}
            </h2>

            {active.youtube_video_id ? (
              <YouTubePlayer key={active.id} videoId={active.youtube_video_id} onEnded={handleEnded} />
            ) : (
              <div className="aspect-video w-full rounded-2xl border border-dashed border-[var(--mocha-light)] flex items-center justify-center text-sm text-[var(--noir)] opacity-50">
                Vidéo à venir
              </div>
            )}

            {active.resources.length > 0 && (
              <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-6 shadow-warm">
                <h3 className="mb-3 text-sm font-semibold text-[var(--cacao)] uppercase tracking-wide">
                  Ressources
                </h3>
                <ul className="space-y-2">
                  {active.resources.map((r) => (
                    <li key={r.url}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[var(--mocha)] hover:text-[var(--cacao)]"
                      >
                        <Download size={16} />
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-8 text-center text-sm text-[var(--noir)] opacity-50">
            Aucun module disponible pour l&apos;instant.
          </div>
        )}
      </div>
    </div>
  );
}
