"use client";

import { useCallback, useState, useTransition } from "react";
import { CheckCircle2, Circle, Download, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { FormationCourse, FormationModule } from "@/types/formation";
import { YouTubePlayer } from "./YouTubePlayer";
import { markLessonCompleteAction } from "../actions";

export function CourseViewer({
  course,
  calendlyUrl,
}: {
  course: FormationCourse;
  calendlyUrl?: string;
}) {
  const [modules, setModules] = useState<FormationModule[]>(course.modules);
  const firstModule = modules.find((m) => m.lessons.length > 0) ?? modules[0] ?? null;
  const [activeModuleId, setActiveModuleId] = useState<string | null>(firstModule?.id ?? null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(firstModule?.lessons[0]?.id ?? null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(firstModule?.id ?? null);
  const [, startTransition] = useTransition();

  const activeModule = modules.find((m) => m.id === activeModuleId) ?? null;
  const activeLesson = activeModule?.lessons.find((l) => l.id === activeLessonId) ?? null;

  const allLessons = modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => l.completed).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const selectLesson = useCallback((moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setExpandedModuleId(moduleId);
  }, []);

  const goToNextLesson = useCallback(() => {
    if (!activeModule || !activeLesson) return;
    const idx = activeModule.lessons.findIndex((l) => l.id === activeLesson.id);
    const nextInModule = activeModule.lessons[idx + 1];
    if (nextInModule) {
      selectLesson(activeModule.id, nextInModule.id);
      return;
    }
    const moduleIdx = modules.findIndex((m) => m.id === activeModule.id);
    const nextModule = modules.slice(moduleIdx + 1).find((m) => m.lessons.length > 0);
    if (nextModule) selectLesson(nextModule.id, nextModule.lessons[0].id);
  }, [activeModule, activeLesson, modules, selectLesson]);

  const handleEnded = useCallback(() => {
    if (!activeLesson) return;
    const lessonId = activeLesson.id;
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, completed: true } : l)),
      }))
    );
    startTransition(async () => {
      await markLessonCompleteAction(lessonId);
    });
    goToNextLesson();
  }, [activeLesson, goToNextLesson]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
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

        <div className="rounded-2xl border border-[var(--mocha-light)] bg-white shadow-warm divide-y divide-[var(--mocha-light)] overflow-hidden">
          {modules.map((m) => {
            const moduleCompleted = m.lessons.length > 0 && m.lessons.every((l) => l.completed);
            const expanded = expandedModuleId === m.id;
            return (
              <div key={m.id}>
                <button
                  onClick={() => setExpandedModuleId(expanded ? null : m.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--sable)] ${
                    m.id === activeModuleId ? "text-[var(--cacao)] font-medium" : "text-[var(--noir)]"
                  }`}
                >
                  {moduleCompleted ? (
                    <CheckCircle2 size={18} className="shrink-0 text-[var(--cacao)]" />
                  ) : (
                    <Circle size={18} className="shrink-0 opacity-40" />
                  )}
                  <span className="flex-1">
                    {m.position}. {m.title}
                  </span>
                  {expanded ? (
                    <ChevronDown size={16} className="shrink-0 opacity-50" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 opacity-50" />
                  )}
                </button>
                {expanded && (
                  <ul className="bg-[var(--sable)]">
                    {m.lessons.length === 0 ? (
                      <li className="px-4 py-2.5 pl-11 text-xs text-[var(--noir)] opacity-50">
                        Aucune vidéo pour l&apos;instant.
                      </li>
                    ) : (
                      m.lessons.map((l) => (
                        <li key={l.id}>
                          <button
                            onClick={() => selectLesson(m.id, l.id)}
                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 pl-11 text-left text-xs transition-colors hover:bg-white ${
                              l.id === activeLessonId
                                ? "bg-white text-[var(--cacao)] font-medium"
                                : "text-[var(--noir)] opacity-80"
                            }`}
                          >
                            {l.completed ? (
                              <CheckCircle2 size={14} className="shrink-0 text-[var(--cacao)]" />
                            ) : (
                              <Circle size={14} className="shrink-0 opacity-40" />
                            )}
                            <span>{l.title}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

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
        {activeModule && activeLesson ? (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--mocha)] mb-1">
                Module {activeModule.position} — {activeModule.title}
              </p>
              <h2
                className="text-xl font-semibold text-[var(--cacao)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {activeLesson.title}
              </h2>
            </div>

            {activeLesson.youtube_video_id ? (
              <YouTubePlayer key={activeLesson.id} videoId={activeLesson.youtube_video_id} onEnded={handleEnded} />
            ) : (
              <div className="aspect-video w-full rounded-2xl border border-dashed border-[var(--mocha-light)] flex items-center justify-center text-sm text-[var(--noir)] opacity-50">
                Vidéo à venir
              </div>
            )}

            {activeModule.resources.length > 0 && (
              <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-6 shadow-warm">
                <h3 className="mb-3 text-sm font-semibold text-[var(--cacao)] uppercase tracking-wide">
                  Ressources du module
                </h3>
                <ul className="space-y-2">
                  {activeModule.resources.map((r) => (
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
