// Classes partagées de l'interface du studio (tokens de globals.css uniquement).

export const card = "bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl";
export const label = "text-sm font-bold text-[var(--noir)]";
export const field =
  "min-h-11 w-full rounded-xl border border-[var(--mocha-light)] bg-[var(--ivoire)] px-3.5 text-[15px] text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)]";
export const textarea =
  "w-full rounded-xl border border-[var(--mocha-light)] bg-[var(--ivoire)] px-3.5 py-2.5 text-[15px] text-[var(--noir)] focus:outline-none focus:border-[var(--mocha)]";
export const smallTitle = "text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)]";
export const muted = "text-[var(--noir)] opacity-60";
export const serif = "font-serif text-[var(--cacao)]";
export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--cacao)] px-5 text-sm font-bold text-[var(--ivoire)] disabled:opacity-50 disabled:cursor-not-allowed";
export const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--mocha)]/40 bg-transparent px-4 text-sm font-bold text-[var(--cacao)] disabled:opacity-50 disabled:cursor-not-allowed";
export const btnDashed =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dashed border-[var(--mocha)] bg-transparent px-4 text-sm text-[var(--cacao)]";

/** Bouton de choix (style, mise en page…) : sélectionné ou non. */
export function choice(on: boolean) {
  return on
    ? "border-2 border-[var(--cacao)] bg-[var(--sable)]"
    : "border border-[var(--mocha-light)] bg-[var(--ivoire)]";
}

/** Pastille bascule (réseaux, onglets). */
export function pill(on: boolean) {
  return on
    ? "min-h-11 rounded-full border border-[var(--cacao)] bg-[var(--cacao)] px-4 text-sm font-bold text-[var(--ivoire)]"
    : "min-h-11 rounded-full border border-[var(--mocha)]/40 bg-transparent px-4 text-sm font-bold text-[var(--cacao)]";
}

export async function uploadFile(file: File, kind: "logo" | "font" | "photo" | "reference" | "export") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await fetch("/api/studio/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Envoi impossible.");
  return json as { url: string; name: string };
}
