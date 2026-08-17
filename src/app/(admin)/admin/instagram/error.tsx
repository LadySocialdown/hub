"use client";

export default function InstagramAnalyticsError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <h1
        className="text-2xl font-semibold text-[var(--cacao)]"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        L&apos;analyse Instagram n&apos;a pas pu se charger
      </h1>
      <p className="text-sm text-[var(--noir)] opacity-70">
        Cause probable : la migration Supabase{" "}
        <code className="bg-[var(--sable)] px-1.5 py-0.5 rounded">
          supabase/migrations/002_instagram_analytics.sql
        </code>{" "}
        n&apos;a pas encore été appliquée sur ce projet Supabase, ou une variable
        d&apos;environnement (<code className="bg-[var(--sable)] px-1.5 py-0.5 rounded">WINDSOR_API_KEY</code>,{" "}
        <code className="bg-[var(--sable)] px-1.5 py-0.5 rounded">ANTHROPIC_API_KEY</code>,{" "}
        <code className="bg-[var(--sable)] px-1.5 py-0.5 rounded">INSTAGRAM_ACCOUNT_ID</code>) est manquante.
        Voir la section « Analyse Instagram automatisée » du README.
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--noir)] opacity-40">Référence erreur : {error.digest}</p>
      )}
      <button
        onClick={() => unstable_retry()}
        className="inline-block px-6 py-2.5 bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
