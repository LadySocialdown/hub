"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
  RessourceContent,
  Answers,
  GridRow,
  PlanRow,
  StepDef,
} from "@/types/ressource";
import {
  evaluateComputed,
  getActiveDiagnostics,
  interpolateSentence,
} from "@/lib/ressource/compute";
import { generatePlanning, suggestPriority } from "@/lib/ressource/planning";
import GridBlock from "./blocks/GridBlock";
import FieldsBlock from "./blocks/FieldsBlock";
import DiagnosticsBlock from "./blocks/DiagnosticsBlock";
import ReflectionBlock from "./blocks/ReflectionBlock";
import PriorityBlock from "./blocks/PriorityBlock";
import RhythmBlock from "./blocks/RhythmBlock";
import PlanBlock from "./blocks/PlanBlock";
import ChecklistBlock from "./blocks/ChecklistBlock";

// ---- State ----

type Phase = "intro" | "step" | "checklist" | "done";

interface State {
  phase: Phase;
  stepIdx: number; // index in content.steps when phase === "step"
  answers: Answers;
  checklist: boolean[];
  saveStatus: "idle" | "saving" | "saved" | "error";
  attemptId: string | null;
}

type Action =
  | { type: "SET_PHASE"; phase: Phase; stepIdx?: number }
  | { type: "SET_ANSWER"; key: string; value: unknown }
  | { type: "SET_CHECKLIST"; checked: boolean[] }
  | { type: "SET_SAVE_STATUS"; status: State["saveStatus"] }
  | { type: "SET_ATTEMPT_ID"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase, stepIdx: action.stepIdx ?? state.stepIdx };
    case "SET_ANSWER":
      return { ...state, answers: { ...state.answers, [action.key]: action.value } };
    case "SET_CHECKLIST":
      return { ...state, checklist: action.checked };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.status };
    case "SET_ATTEMPT_ID":
      return { ...state, attemptId: action.id };
    default:
      return state;
  }
}

function buildInitialState(
  initial: { answers: Answers; current_step?: string | null; completed_at?: string | null; id?: string } | null
): State {
  const answers = initial?.answers ?? {};
  const checklist = (answers["checklist"] as boolean[] | undefined) ?? [];
  const stepId = initial?.current_step ?? null;
  const completed = !!initial?.completed_at;

  let phase: Phase = "intro";
  let stepIdx = 0;
  if (completed) {
    phase = "done";
  } else if (stepId === "checklist") {
    phase = "checklist";
  } else if (stepId) {
    phase = "step";
  }

  return {
    phase,
    stepIdx,
    answers,
    checklist,
    saveStatus: "idle",
    attemptId: initial?.id ?? null,
  };
}

// ---- Component ----

export default function RessourceEngine({
  content,
  initialAttempt,
  resourceRoute,
}: {
  content: RessourceContent;
  initialAttempt: {
    id: string;
    answers: Answers;
    current_step?: string | null;
    completed_at?: string | null;
  } | null;
  resourceRoute: string; // e.g. "/dashboard/formation/ressources/p1-1-..."
}) {
  const [state, dispatch] = useReducer(reducer, buildInitialState(initialAttempt));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step: StepDef | null =
    state.phase === "step" ? content.steps[state.stepIdx] ?? null : null;

  // Evaluate computed for current step
  const stepComputed = step?.computed
    ? evaluateComputed(step.computed, state.answers)
    : {};

  // Evaluate audit step computed for priority suggestion (always)
  const auditStep = content.steps.find((s) => s.id === "audit");
  const auditComputed = auditStep?.computed
    ? evaluateComputed(auditStep.computed, state.answers)
    : {};
  const auditRows = (state.answers["posts"] as GridRow[] | undefined) ?? [];
  const filledAuditRows = auditRows.filter((r) =>
    Object.values(r).some((v) => v !== undefined && v !== "" && v !== null)
  ).length;
  const prioritySuggestion = suggestPriority(
    auditComputed["nbA"] ?? null,
    auditComputed["nbC"] ?? null,
    auditComputed["nbF"] ?? null,
    filledAuditRows
  );

  // ---- Save ----

  const scheduleSave = useCallback(
    (answers: Answers, currentStep: string, checklist: boolean[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        dispatch({ type: "SET_SAVE_STATUS", status: "saving" });
        try {
          const body = {
            resourceId: content.id,
            resourceVersion: content.version,
            answers: { ...answers, checklist },
            currentStep,
            attemptId: state.attemptId,
          };
          const res = await fetch("/api/ressources/attempts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("save failed");
          const data = await res.json();
          if (data.id && !state.attemptId) {
            dispatch({ type: "SET_ATTEMPT_ID", id: data.id });
          }
          dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
        } catch {
          dispatch({ type: "SET_SAVE_STATUS", status: "error" });
        }
      }, 800);
    },
    [content.id, content.version, state.attemptId]
  );

  // Determine current step ID for save tracking
  const currentStepId =
    state.phase === "intro"
      ? "intro"
      : state.phase === "checklist"
      ? "checklist"
      : state.phase === "done"
      ? "done"
      : step?.id ?? "intro";

  function setAnswer(key: string, value: unknown) {
    dispatch({ type: "SET_ANSWER", key, value });
    scheduleSave({ ...state.answers, [key]: value }, currentStepId, state.checklist);
  }

  function setChecklist(checked: boolean[]) {
    dispatch({ type: "SET_CHECKLIST", checked });
    scheduleSave(state.answers, "checklist", checked);
  }

  function goToStep(idx: number) {
    const s = content.steps[idx];
    if (!s) return;
    dispatch({ type: "SET_PHASE", phase: "step", stepIdx: idx });
    scheduleSave(state.answers, s.id, state.checklist);
  }

  function goNext() {
    if (state.phase === "intro") {
      goToStep(0);
    } else if (state.phase === "step") {
      if (state.stepIdx < content.steps.length - 1) {
        goToStep(state.stepIdx + 1);
      } else {
        dispatch({ type: "SET_PHASE", phase: "checklist" });
        scheduleSave(state.answers, "checklist", state.checklist);
      }
    }
  }

  function goPrev() {
    if (state.phase === "step" && state.stepIdx > 0) {
      goToStep(state.stepIdx - 1);
    } else if (state.phase === "step" && state.stepIdx === 0) {
      dispatch({ type: "SET_PHASE", phase: "intro" });
      scheduleSave(state.answers, "intro", state.checklist);
    } else if (state.phase === "checklist") {
      goToStep(content.steps.length - 1);
    }
  }

  async function generateReport() {
    dispatch({ type: "SET_SAVE_STATUS", status: "saving" });
    const allComputed: Record<string, Record<string, number | null>> = {};
    for (const s of content.steps) {
      if (s.computed) allComputed[s.id] = evaluateComputed(s.computed, state.answers);
    }
    try {
      const res = await fetch("/api/ressources/attempts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: content.id,
          resourceVersion: content.version,
          answers: { ...state.answers, checklist: state.checklist },
          currentStep: "done",
          computed: allComputed,
          completedAt: new Date().toISOString(),
          attemptId: state.attemptId,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
      dispatch({ type: "SET_PHASE", phase: "done" });
      if (data.id) dispatch({ type: "SET_ATTEMPT_ID", id: data.id });
    } catch {
      dispatch({ type: "SET_SAVE_STATUS", status: "error" });
    }
  }

  // Cleanup timer
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  // ---- Render ----

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-1">
          Pilier {content.pilier} · Point {content.point}
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--noir)] opacity-70 max-w-xl">
          {content.subtitle}
        </p>
      </div>

      {/* Step progress bar */}
      <StepProgress
        steps={content.steps}
        phase={state.phase}
        stepIdx={state.stepIdx}
        onJump={(idx) => goToStep(idx)}
      />

      {/* Save indicator */}
      <SaveIndicator status={state.saveStatus} />

      {/* ---- INTRO ---- */}
      {state.phase === "intro" && (
        <IntroView content={content} onStart={() => goNext()} />
      )}

      {/* ---- STEP ---- */}
      {state.phase === "step" && step && (
        <StepView
          step={step}
          answers={state.answers}
          computed={stepComputed}
          prioritySuggestion={prioritySuggestion}
          onSetAnswer={setAnswer}
          onGeneratePlan={() => {
            const priority = String(state.answers["priorite"] ?? "C");
            const rhythm = Number(state.answers["rythme"] ?? 3);
            const existing = (state.answers["plan"] as PlanRow[][] | undefined) ?? [];
            const plan = generatePlanning(priority, rhythm, existing);
            setAnswer("plan", plan);
          }}
          canGeneratePlan={!!(state.answers["priorite"] && state.answers["rythme"])}
        />
      )}

      {/* ---- CHECKLIST ---- */}
      {state.phase === "checklist" && (
        <div className="space-y-6">
          <ChecklistBlock
            items={content.checklist}
            checked={state.checklist}
            onChange={setChecklist}
          />
          <div className="flex justify-between items-center pt-4">
            <NavButton direction="prev" onClick={goPrev} />
            <button
              type="button"
              onClick={generateReport}
              disabled={state.saveStatus === "saving"}
              className="rounded-full bg-[var(--cacao)] text-[var(--ivoire)] px-8 py-3 text-sm font-medium hover:bg-[var(--mocha)] transition-colors disabled:opacity-50"
            >
              Générer mon rapport
            </button>
          </div>
        </div>
      )}

      {/* ---- DONE ---- */}
      {state.phase === "done" && (
        <div className="rounded-2xl border border-[var(--cacao)] bg-[var(--sable)] p-8 text-center space-y-4">
          <p
            className="text-2xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Ton rapport est prêt.
          </p>
          <p className="text-sm text-[var(--noir)] opacity-70">
            {content.report.closing}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href={`${resourceRoute}/rapport`}
              className="rounded-full bg-[var(--cacao)] text-[var(--ivoire)] px-8 py-3 text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
            >
              Voir mon rapport
            </a>
            <a
              href={`${resourceRoute}/rapport?format=pdf`}
              className="rounded-full border border-[var(--cacao)] text-[var(--cacao)] px-8 py-3 text-sm font-medium hover:bg-[var(--sable)] transition-colors"
            >
              Télécharger en PDF
            </a>
          </div>
          {content.next && (
            <p className="text-xs text-[var(--noir)] opacity-50 pt-2">
              Prochain point : {content.next.title}
            </p>
          )}
        </div>
      )}

      {/* Step navigation (shown during steps) */}
      {state.phase === "step" && (
        <div className="flex justify-between items-center pt-4 border-t border-[var(--mocha-light)]">
          <NavButton direction="prev" onClick={goPrev} />
          <NavButton
            direction="next"
            onClick={goNext}
            label={
              state.stepIdx === content.steps.length - 1
                ? "Ma checklist"
                : "Étape suivante"
            }
          />
        </div>
      )}
    </div>
  );
}

// ---- Sub-components ----

function SaveIndicator({ status }: { status: State["saveStatus"] }) {
  if (status === "idle") return null;
  return (
    <p
      className="text-xs text-right"
      aria-live="polite"
      style={{
        color:
          status === "saved"
            ? "var(--mocha)"
            : status === "error"
            ? "crimson"
            : "var(--noir)",
        opacity: status === "saving" ? 0.5 : 0.7,
      }}
    >
      {status === "saving" ? "Enregistrement…" : status === "saved" ? "Enregistré" : "Erreur d'enregistrement"}
    </p>
  );
}

function StepProgress({
  steps,
  phase,
  stepIdx,
  onJump,
}: {
  steps: StepDef[];
  phase: Phase;
  stepIdx: number;
  onJump: (idx: number) => void;
}) {
  const allPhases = [
    { id: "intro", label: "Intro" },
    ...steps.map((s, i) => ({ id: s.id, label: s.title, idx: i })),
    { id: "checklist", label: "Checklist" },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Progression">
      {allPhases.map((p, i) => {
        const isCurrent =
          (phase === "intro" && p.id === "intro") ||
          (phase === "step" && "idx" in p && p.idx === stepIdx) ||
          (phase === "checklist" && p.id === "checklist") ||
          (phase === "done" && p.id === "checklist");
        const isPast =
          phase === "done" ||
          (phase === "checklist" && p.id !== "checklist") ||
          (phase === "step" && "idx" in p && (p.idx ?? 0) < stepIdx) ||
          (phase === "step" && p.id === "intro");

        return (
          <div key={p.id} className="flex items-center gap-1">
            {i > 0 && <div className="w-4 h-px bg-[var(--mocha-light)]" />}
            <button
              type="button"
              onClick={() => {
                if ("idx" in p && p.idx !== undefined) onJump(p.idx);
              }}
              disabled={!("idx" in p) && p.id !== "intro"}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cacao)] ${
                isCurrent
                  ? "bg-[var(--cacao)] text-[var(--ivoire)]"
                  : isPast
                  ? "bg-[var(--sable)] text-[var(--cacao)]"
                  : "bg-transparent text-[var(--noir)] opacity-40"
              }`}
            >
              {p.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function IntroView({
  content,
  onStart,
}: {
  content: RessourceContent;
  onStart: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {content.intro.path.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-[var(--mocha-light)] p-5 shadow-warm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-[var(--cacao)] text-[var(--ivoire)] text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p
                className="font-semibold text-[var(--cacao)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {p.title}
              </p>
            </div>
            <p className="text-sm text-[var(--noir)] opacity-70">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[var(--sable)] border border-[var(--mocha-light)] p-6">
        <p className="text-xs uppercase tracking-wider text-[var(--mocha)] mb-3">
          Prépare
        </p>
        <ul className="space-y-2">
          {content.intro.prepare.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--noir)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--mocha)] mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <blockquote
        className="border-l-2 border-[var(--mocha)] pl-5 italic text-[var(--cacao)] text-base"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {content.intro.quote}
      </blockquote>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-[var(--cacao)] text-[var(--ivoire)] px-8 py-3 text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
        >
          Commencer
        </button>
      </div>
    </div>
  );
}

function StepView({
  step,
  answers,
  computed,
  prioritySuggestion,
  onSetAnswer,
  onGeneratePlan,
  canGeneratePlan,
}: {
  step: StepDef;
  answers: Answers;
  computed: Record<string, number | null>;
  prioritySuggestion: string;
  onSetAnswer: (key: string, value: unknown) => void;
  onGeneratePlan: () => void;
  canGeneratePlan: boolean;
}) {
  const diagnostics = step.diagnostics
    ? getActiveDiagnostics(step.diagnostics, step.fallbackDiagnostic, computed)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <p
            className="text-2xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {step.title}
          </p>
          <span className="text-xs text-[var(--mocha)] border border-[var(--mocha-light)] rounded-full px-2 py-0.5">
            {step.duration}
          </span>
          {step.video && (
            <span className="text-xs text-[var(--noir)] opacity-50">
              Vidéo {step.video}
            </span>
          )}
        </div>
        {step.why && (
          <p className="text-sm text-[var(--noir)] opacity-70 max-w-2xl">{step.why}</p>
        )}
      </div>

      {step.howto && step.howto.length > 0 && (
        <ol className="space-y-2">
          {step.howto.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[var(--noir)]">
              <span className="w-6 h-6 rounded-full bg-[var(--mocha-light)] text-[var(--cacao)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      )}

      {step.grid && (
        <GridBlock
          def={step.grid}
          rows={(answers[step.grid.id] as GridRow[] | undefined) ?? []}
          onChange={(rows) => onSetAnswer(step.grid!.id, rows)}
        />
      )}

      {step.fields && (
        <FieldsBlock
          fields={step.fields}
          answers={answers}
          computed={computed}
          objectiveSentence={step.objectiveSentence}
          note={step.note}
          onChange={(id, val) => onSetAnswer(id, val)}
        />
      )}

      {diagnostics.length > 0 && (
        <DiagnosticsBlock diagnostics={diagnostics} warning={step.warning} />
      )}

      {step.reflection && (
        <ReflectionBlock
          def={step.reflection}
          value={String(answers[step.reflection.id] ?? "")}
          onChange={(v) => onSetAnswer(step.reflection!.id, v)}
        />
      )}

      {step.priority && (
        <PriorityBlock
          def={step.priority}
          value={String(answers[step.priority.id] ?? "")}
          suggestion={step.priority.suggestFrom ? prioritySuggestion : undefined}
          onChange={(v) => onSetAnswer(step.priority!.id, v)}
        />
      )}

      {step.rhythm && (
        <RhythmBlock
          def={step.rhythm}
          value={Number(answers[step.rhythm.id] ?? step.rhythm.default)}
          onChange={(v) => onSetAnswer(step.rhythm!.id, v)}
        />
      )}

      {step.plan && (
        <PlanBlock
          def={step.plan}
          plan={(answers[step.plan.id] as PlanRow[][] | undefined) ?? []}
          onChangePlan={(plan) => onSetAnswer(step.plan!.id, plan)}
          onGenerate={onGeneratePlan}
          canGenerate={canGeneratePlan}
        />
      )}
    </div>
  );
}

function NavButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label?: string;
}) {
  if (direction === "prev") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-sm text-[var(--noir)] opacity-50 hover:opacity-100 transition-opacity"
      >
        ← Retour
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-[var(--cacao)] text-[var(--ivoire)] px-6 py-2.5 text-sm font-medium hover:bg-[var(--mocha)] transition-colors"
    >
      {label ?? "Étape suivante"} →
    </button>
  );
}
