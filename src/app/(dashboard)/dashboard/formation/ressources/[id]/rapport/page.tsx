import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import fs from "node:fs";
import path from "node:path";
import type { RessourceContent, Answers, GridRow, PlanRow, ComputedValues } from "@/types/ressource";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { evaluateComputed, getActiveDiagnostics, interpolateSentence } from "@/lib/ressource/compute";
import RapportPlanInteractif from "./RapportPlanInteractif";

export const dynamic = "force-dynamic";

function loadContent(id: string): RessourceContent | null {
  try {
    const filePath = path.join(process.cwd(), "content", "ressources", `${id}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as RessourceContent;
  } catch {
    return null;
  }
}

const OBJ_LABELS: Record<string, string> = { A: "Attirer", C: "Convaincre", F: "Fidéliser" };
const OBJ_COLORS: Record<string, string> = {
  A: "bg-[var(--cacao)] text-[var(--ivoire)]",
  C: "bg-[var(--mocha)] text-[var(--ivoire)]",
  F: "bg-[var(--sable)] text-[var(--cacao)]",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = loadContent(id);
  return { title: content ? `Rapport · ${content.title}` : "Rapport" };
}

export default async function RapportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = loadContent(id);
  if (!content) notFound();

  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServerSupabaseClient();
  const { data: attempt } = await supabase
    .from("resource_attempts")
    .select("id, answers, computed, completed_at")
    .eq("user_id", userId)
    .eq("resource_id", id)
    .order("attempt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!attempt?.completed_at) {
    redirect(`/dashboard/formation/ressources/${id}`);
  }

  const answers = (attempt.answers as Answers) ?? {};
  const checklist = (answers["checklist"] as boolean[] | undefined) ?? [];

  // Recompute all step computeds (stored computed may be stale if version changed)
  const allComputed: Record<string, ComputedValues> = {};
  for (const step of content.steps) {
    if (step.computed) allComputed[step.id] = evaluateComputed(step.computed, answers);
  }

  // Audit diagnostics
  const auditStep = content.steps.find((s) => s.id === "audit");
  const auditComputed = allComputed["audit"] ?? {};
  const auditDiagnostics = auditStep?.diagnostics
    ? getActiveDiagnostics(auditStep.diagnostics, auditStep.fallbackDiagnostic, auditComputed)
    : [];
  const phraseDiagnostic = String(answers["phraseDiagnostic"] ?? "");

  // Calcul
  const calcComputed = allComputed["calcul"] ?? {};
  const calcStep = content.steps.find((s) => s.id === "calcul");
  const objectiveSentence = calcStep?.objectiveSentence
    ? interpolateSentence(calcStep.objectiveSentence, calcComputed, answers)
    : null;

  // Planning
  const priorite = String(answers["priorite"] ?? "");
  const rythme = Number(answers["rythme"] ?? 3);
  const plan = (answers["plan"] as PlanRow[][] | undefined) ?? [];
  const prioriteLabel = content.steps
    .find((s) => s.id === "planning")
    ?.priority?.options.find((o) => o.value === priorite)?.label;

  const completedAt = new Date(attempt.completed_at!).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10 print:py-6">
      {/* Header */}
      <div className="border-b border-[var(--mocha-light)] pb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--mocha)] mb-1">
          Rapport généré le {completedAt}
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {content.report.title}
        </h1>
        <div className="mt-4 flex gap-3 print:hidden">
          <a
            href={`/dashboard/formation/ressources/${id}`}
            className="text-xs text-[var(--noir)] opacity-50 hover:opacity-100"
          >
            ← Retour à la ressource
          </a>
          <a
            href={`/api/ressources/pdf?id=${id}`}
            className="text-xs text-[var(--mocha)] hover:underline"
          >
            Télécharger en PDF
          </a>
        </div>
      </div>

      {/* 1. Diagnostic */}
      <section aria-label="Diagnostic">
        <SectionTitle>Diagnostic</SectionTitle>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { key: "nbA", label: "Attirer" },
            { key: "nbC", label: "Convaincre" },
            { key: "nbF", label: "Fidéliser" },
          ].map(({ key, label }) => (
            <div key={key} className="rounded-xl bg-[var(--sable)] border border-[var(--mocha-light)] p-4 text-center">
              <p
                className="text-4xl font-bold text-[var(--cacao)] leading-none"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {auditComputed[key] !== null && auditComputed[key] !== undefined
                  ? auditComputed[key]
                  : "—"}
              </p>
              <p className="text-xs text-[var(--noir)] opacity-60 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {auditDiagnostics.map((d) => (
            <div key={d.id} className="rounded-2xl bg-white border border-[var(--mocha-light)] p-5 shadow-warm">
              <p
                className="font-semibold text-[var(--cacao)] mb-1"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {d.title}
              </p>
              <p className="text-sm text-[var(--noir)] opacity-80">{d.text}</p>
            </div>
          ))}
        </div>
        {phraseDiagnostic && (
          <blockquote className="mt-4 border-l-2 border-[var(--mocha)] pl-4 italic text-sm text-[var(--cacao)]">
            {phraseDiagnostic}
          </blockquote>
        )}
      </section>

      {/* 2. Objectif */}
      {objectiveSentence && (
        <section aria-label="Objectif">
          <SectionTitle>Mon objectif</SectionTitle>
          <div className="rounded-2xl bg-[var(--sable)] border border-[var(--mocha-light)] p-6">
            <p
              className="text-lg font-semibold text-[var(--cacao)] italic"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {objectiveSentence}
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "clientes", label: "clientes / mois" },
                { key: "demandes", label: "demandes totales" },
                { key: "demandesReseaux", label: "via les réseaux" },
                { key: "parSemaine", label: "demandes / semaine" },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <p
                    className="text-3xl font-bold text-[var(--cacao)]"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {calcComputed[key] ?? "—"}
                  </p>
                  <p className="text-xs text-[var(--noir)] opacity-60 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Priorité & rythme */}
      {priorite && (
        <section aria-label="Priorité">
          <SectionTitle>Ma priorité</SectionTitle>
          <div className="flex items-center gap-4 rounded-2xl bg-white border border-[var(--mocha-light)] p-5 shadow-warm">
            <span
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${OBJ_COLORS[priorite] ?? ""}`}
            >
              {priorite}
            </span>
            <div>
              <p className="font-semibold text-[var(--cacao)]">{prioriteLabel ?? priorite}</p>
              <p className="text-sm text-[var(--noir)] opacity-60">
                {rythme} publication{rythme > 1 ? "s" : ""} par semaine
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Planning interactif (cases cochables) */}
      {plan.length > 0 && (
        <section aria-label="Planning">
          <SectionTitle>Mon planning</SectionTitle>
          <RapportPlanInteractif
            initialPlan={plan}
            resourceId={id}
          />
        </section>
      )}

      {/* 5. Checklist */}
      <section aria-label="Checklist">
        <SectionTitle>Ma checklist publication</SectionTitle>
        <div className="space-y-2">
          {content.checklist.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
                checklist[i] ? "border-[var(--cacao)] bg-[var(--sable)]" : "border-[var(--mocha-light)] bg-white"
              }`}
            >
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  checklist[i]
                    ? "border-[var(--cacao)] bg-[var(--cacao)]"
                    : "border-[var(--mocha-light)]"
                }`}
              >
                {checklist[i] && <span className="text-white text-xs">✓</span>}
              </span>
              <p
                className={`text-sm ${checklist[i] ? "text-[var(--cacao)] font-medium" : "text-[var(--noir)]"}`}
              >
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Followups */}
      {content.followups.length > 0 && (
        <section aria-label="Suites">
          <SectionTitle>Mes prochaines étapes</SectionTitle>
          <div className="space-y-3">
            {content.followups.map((f) => (
              <div
                key={f.id}
                className="flex items-start gap-3 rounded-xl bg-white border border-[var(--mocha-light)] px-4 py-3"
              >
                <span className="w-2 h-2 rounded-full bg-[var(--mocha)] mt-1.5 shrink-0" />
                <p className="text-sm text-[var(--noir)]">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Closing */}
      <div className="border-t border-[var(--mocha-light)] pt-6 text-center">
        <p
          className="text-xl italic text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {content.report.closing}
        </p>
        {content.next && (
          <p className="mt-3 text-xs text-[var(--noir)] opacity-50">
            Prochain point : {content.next.title}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl font-semibold text-[var(--cacao)] mb-4"
      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
    >
      {children}
    </h2>
  );
}
