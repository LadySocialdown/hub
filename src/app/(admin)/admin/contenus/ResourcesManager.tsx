"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { ResourceType } from "@/types/supabase";
import {
  createResourceAction,
  updateResourceAction,
  deleteResourceAction,
  type ResourceInput,
} from "./resource-actions";

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  is_free: boolean;
  price: number | null; // centimes
  content_url: string | null;
  tags: string[];
}

const TYPE_OPTIONS: Array<{ value: ResourceType; label: string }> = [
  { value: "article", label: "Article" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Vidéo" },
  { value: "ebook", label: "Ebook" },
  { value: "outil", label: "Outil" },
];

function ResourceForm({
  resource,
  onDone,
}: {
  resource?: ResourceItem;
  onDone?: () => void;
}) {
  const [title, setTitle] = useState(resource?.title ?? "");
  const [type, setType] = useState<ResourceType>(resource?.type ?? "pdf");
  const [isFree, setIsFree] = useState(resource?.is_free ?? true);
  const [priceEuros, setPriceEuros] = useState(resource?.price ? String(resource.price / 100) : "");
  const [contentUrl, setContentUrl] = useState(resource?.content_url ?? "");
  const [tags, setTags] = useState(resource?.tags.join(", ") ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSave() {
    setFeedback(null);
    const input: ResourceInput = {
      title,
      type,
      is_free: isFree,
      price: isFree ? null : Math.round(parseFloat(priceEuros || "0") * 100),
      content_url: contentUrl,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      const result = resource
        ? await updateResourceAction(resource.id, input)
        : await createResourceAction(input);

      if (!result.ok) {
        setFeedback({ ok: false, message: result.message });
        return;
      }
      setFeedback({ ok: true, message: "Enregistré." });
      if (!resource) {
        setTitle("");
        setContentUrl("");
        setTags("");
        setPriceEuros("");
      }
      onDone?.();
    });
  }

  function handleDelete() {
    if (!resource) return;
    if (!confirm(`Supprimer « ${resource.title} » ?`)) return;
    startTransition(async () => {
      const result = await deleteResourceAction(resource.id);
      if (!result.ok) setFeedback({ ok: false, message: result.message });
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--mocha-light)] bg-white p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-full border border-[var(--mocha-light)] px-4 py-2 text-sm focus:border-[var(--cacao)] focus:outline-none"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="rounded-full border border-[var(--mocha-light)] px-4 py-2 text-sm focus:border-[var(--cacao)] focus:outline-none"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm text-[var(--noir)]">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
          Gratuite (compte requis)
        </label>
        {!isFree && (
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Prix en €"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            className="w-28 rounded-full border border-[var(--mocha-light)] px-3 py-1.5 text-sm focus:border-[var(--cacao)] focus:outline-none"
          />
        )}
      </div>

      <input
        type="text"
        placeholder={isFree ? "Lien de téléchargement direct" : "Lien Drive envoyé par email après achat"}
        value={contentUrl}
        onChange={(e) => setContentUrl(e.target.value)}
        className="w-full rounded-full border border-[var(--mocha-light)] px-4 py-2 text-sm focus:border-[var(--cacao)] focus:outline-none"
      />

      <input
        type="text"
        placeholder="Tags séparés par des virgules"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full rounded-full border border-[var(--mocha-light)] px-4 py-2 text-sm focus:border-[var(--cacao)] focus:outline-none"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-[var(--cacao)] px-4 py-2 text-xs font-medium text-[var(--ivoire)] hover:bg-[var(--mocha)] transition-colors disabled:opacity-60"
        >
          {isPending ? "…" : resource ? "Enregistrer" : "Ajouter la ressource"}
        </button>
        {resource && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-[var(--noir)] opacity-60 hover:opacity-100 hover:text-red-700"
          >
            <Trash2 size={14} /> Supprimer
          </button>
        )}
        {feedback && (
          <span className={`text-xs ${feedback.ok ? "text-green-700" : "text-red-700"}`}>
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}

export function ResourcesManager({ resources }: { resources: ResourceItem[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--cacao)] mb-2">Ajouter une ressource</h3>
        <ResourceForm />
      </div>

      {resources.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--cacao)] mb-2">Ressources existantes</h3>
          <div className="space-y-3">
            {resources.map((r) => (
              <ResourceForm key={r.id} resource={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
