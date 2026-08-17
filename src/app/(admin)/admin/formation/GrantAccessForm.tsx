"use client";

import { useState, useTransition } from "react";
import { FORMATION_COURSE_LABELS, MANUAL_GRANT_COURSE_SLUGS } from "@/lib/formation/constants";
import { grantManualFormationAccessAction } from "./actions";

export function GrantAccessForm() {
  const [email, setEmail] = useState("");
  const [courseSlug, setCourseSlug] = useState(MANUAL_GRANT_COURSE_SLUGS[0]);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await grantManualFormationAccessAction(email, courseSlug);
      if (!result.ok) {
        setFeedback({ ok: false, message: result.message });
        return;
      }
      setFeedback({ ok: true, message: `Accès envoyé à ${email}.` });
      setEmail("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--mocha-light)] shadow-warm bg-white p-6 space-y-4">
      <h2
        className="text-lg font-semibold text-[var(--cacao)]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Envoyer l&apos;accès à une élève
      </h2>
      <p className="text-sm text-[var(--noir)] opacity-70">
        Pour Next Level et Level Up, après l&apos;appel découverte et la confirmation d&apos;inscription.
        Si l&apos;élève a déjà un compte, l&apos;accès est immédiat. Sinon, elle reçoit un email pour créer
        son compte.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-[var(--mocha-light)] px-4 py-2.5 text-sm focus:border-[var(--cacao)] focus:outline-none"
        />
        <select
          value={courseSlug}
          onChange={(e) => setCourseSlug(e.target.value as typeof courseSlug)}
          className="rounded-full border border-[var(--mocha-light)] px-4 py-2.5 text-sm focus:border-[var(--cacao)] focus:outline-none"
        >
          {MANUAL_GRANT_COURSE_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {FORMATION_COURSE_LABELS[slug]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--cacao)] px-5 py-2.5 text-sm font-medium text-[var(--ivoire)] transition-colors hover:bg-[var(--mocha)] disabled:opacity-60"
        >
          {isPending ? "Envoi…" : "Envoyer l'accès"}
        </button>
      </div>

      {feedback && (
        <p className={`text-sm ${feedback.ok ? "text-green-700" : "text-red-700"}`}>{feedback.message}</p>
      )}
    </form>
  );
}
