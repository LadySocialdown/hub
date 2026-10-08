"use client";

export default function ChecklistBlock({
  items,
  checked,
  onChange,
}: {
  items: string[];
  checked: boolean[];
  onChange: (checked: boolean[]) => void;
}) {
  function toggle(idx: number) {
    const next = [...checked];
    next[idx] = !next[idx];
    onChange(next);
  }

  const allDone = items.every((_, i) => checked[i]);

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wider text-[var(--mocha)] mb-4">
        Avant de publier, je vérifie que…
      </p>
      {items.map((item, i) => (
        <label
          key={i}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
            checked[i]
              ? "border-[var(--cacao)] bg-[var(--sable)]"
              : "border-[var(--mocha-light)] bg-white hover:border-[var(--mocha)]"
          }`}
        >
          <input
            type="checkbox"
            checked={!!checked[i]}
            onChange={() => toggle(i)}
            className="mt-0.5 w-4 h-4 accent-[var(--cacao)] rounded shrink-0"
          />
          <span
            className={`text-sm transition-colors ${
              checked[i] ? "text-[var(--cacao)] font-medium" : "text-[var(--noir)]"
            }`}
          >
            {item}
          </span>
        </label>
      ))}
      {allDone && (
        <div
          className="rounded-xl border border-[var(--cacao)] bg-[var(--sable)] px-4 py-3 text-center text-sm font-medium text-[var(--cacao)]"
          role="status"
        >
          Tout est coché. Tu es prête.
        </div>
      )}
    </div>
  );
}
