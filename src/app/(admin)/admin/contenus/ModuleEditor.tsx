"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FormationModule, ModuleResource } from "@/types/formation";
import { updateModuleContentAction } from "./actions";

export function ModuleEditor({ module: m }: { module: FormationModule }) {
  const [youtubeVideoId, setYoutubeVideoId] = useState(m.youtube_video_id ?? "");
  const [resources, setResources] = useState<ModuleResource[]>(m.resources);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function updateResource(index: number, field: keyof ModuleResource, value: string) {
    setResources((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addResource() {
    setResources((prev) => [...prev, { title: "", url: "" }]);
  }

  function removeResource(index: number) {
    setResources((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateModuleContentAction(m.id, youtubeVideoId, resources);
      setFeedback(
        result.ok
          ? { ok: true, message: "Enregistré." }
          : { ok: false, message: result.message }
      );
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--cacao)]">
        {m.position}. {m.title}
      </h3>

      <div>
        <label className="block text-xs uppercase tracking-wide text-[var(--mocha)] mb-1.5">
          ID vidéo YouTube
        </label>
        <input
          type="text"
          placeholder="ex. dQw4w9WgXcQ"
          value={youtubeVideoId}
          onChange={(e) => setYoutubeVideoId(e.target.value)}
          className="w-full rounded-full border border-[var(--mocha-light)] px-4 py-2 text-sm focus:border-[var(--cacao)] focus:outline-none"
        />
        <p className="mt-1 text-xs text-[var(--noir)] opacity-50">
          L&apos;ID est la partie après <code>?v=</code> dans l&apos;URL YouTube. Laisser vide tant
          que la vidéo n&apos;est pas prête.
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-[var(--mocha)] mb-1.5">
          Ressources téléchargeables
        </label>
        <div className="space-y-2">
          {resources.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Titre"
                value={r.title}
                onChange={(e) => updateResource(i, "title", e.target.value)}
                className="flex-1 rounded-full border border-[var(--mocha-light)] px-3 py-1.5 text-sm focus:border-[var(--cacao)] focus:outline-none"
              />
              <input
                type="text"
                placeholder="URL"
                value={r.url}
                onChange={(e) => updateResource(i, "url", e.target.value)}
                className="flex-[2] rounded-full border border-[var(--mocha-light)] px-3 py-1.5 text-sm focus:border-[var(--cacao)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeResource(i)}
                className="shrink-0 p-1.5 text-[var(--noir)] opacity-50 hover:opacity-100 hover:text-red-700"
                aria-label="Supprimer cette ressource"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addResource}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--mocha)] hover:text-[var(--cacao)]"
        >
          <Plus size={14} /> Ajouter une ressource
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-[var(--cacao)] px-4 py-2 text-xs font-medium text-[var(--ivoire)] hover:bg-[var(--mocha)] transition-colors disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {feedback && (
          <span className={`text-xs ${feedback.ok ? "text-green-700" : "text-red-700"}`}>
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}
