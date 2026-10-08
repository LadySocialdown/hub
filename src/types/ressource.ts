export type ObjectiveValue = "A" | "C" | "F" | "0";

export interface GridColumn {
  id: string;
  label: string;
  type: "text" | "number" | "objective";
  wide?: boolean;
  allowNone?: boolean;
}

export interface GridBlockDef {
  id: string;
  rows: number;
  minFilled?: number;
  columns: GridColumn[];
  example?: Record<string, string | number>;
  help?: Record<string, string>;
}

export interface FieldDef {
  id: string;
  label: string;
  type: "number" | "text";
  unit?: string;
  example?: string | number;
  placeholder?: string;
  help?: string;
}

export type ComputedOp =
  | "countEq"
  | "countDiff"
  | "divCeil"
  | "divPctCeil"
  | "mulPctCeil"
  | "perWeek";

export interface ComputedDef {
  op: ComputedOp;
  grid?: string;
  col?: string;
  colA?: string;
  colB?: string;
  ignore?: string;
  value?: string;
  a?: string;
  b?: string;
  pct?: string;
}

export interface DiagnosticCondition {
  var: string;
  gt?: number;
  gte?: number;
  lte?: number;
  gteVar?: string;
  plus?: number;
}

export interface DiagnosticDef {
  id: string;
  when: DiagnosticCondition;
  title: string;
  text: string;
}

export interface FallbackDiagnostic {
  title: string;
  text: string;
}

export interface PriorityOption {
  value: string;
  label: string;
  when: string;
  text: string;
}

export interface PriorityBlockDef {
  id: string;
  options: PriorityOption[];
  suggestFrom?: string;
}

export interface RhythmBlockDef {
  id: string;
  label: string;
  min: number;
  max: number;
  default: number;
  help?: string;
}

export interface PlanBlockDef {
  id: string;
  weeks: number;
  columns: string[];
  example?: Record<string, string>;
}

export interface ReflectionBlockDef {
  id: string;
  label: string;
  placeholder?: string;
}

export interface StepDef {
  id: string;
  title: string;
  duration: string;
  video?: string;
  why?: string;
  howto?: string[];
  warning?: string;
  note?: string;
  grid?: GridBlockDef;
  fields?: FieldDef[];
  computed?: Record<string, ComputedDef>;
  diagnostics?: DiagnosticDef[];
  fallbackDiagnostic?: FallbackDiagnostic;
  reflection?: ReflectionBlockDef;
  objectiveSentence?: string;
  priority?: PriorityBlockDef;
  rhythm?: RhythmBlockDef;
  plan?: PlanBlockDef;
}

export interface RessourceContent {
  id: string;
  version: number;
  programme: string;
  pilier: number;
  point: number;
  title: string;
  subtitle: string;
  duration: string;
  videos: string[];
  intro: {
    path: Array<{ title: string; text: string }>;
    prepare: string[];
    quote: string;
  };
  steps: StepDef[];
  checklist: string[];
  report: {
    title: string;
    sections: string[];
    closing: string;
  };
  followups: Array<{
    id: string;
    type: "weekly" | "retake";
    text: string;
    afterDays?: number;
    step?: string;
  }>;
  next: { pilier: number; point: number; title: string };
}

// ---- Runtime answer types ----

export interface GridRow {
  [colId: string]: string | number;
}

export interface PlanRow {
  objectif: string;
  sujet: string;
  cta: string;
  fait: boolean;
}

export type Answers = Record<string, unknown>;

export type ComputedValues = Record<string, number | null>;
