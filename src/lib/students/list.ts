import { createServerSupabaseClient } from "@/lib/supabase/server";

export type StudentMode = "cpf" | "direct" | "invitation";

export interface StudentRow {
  key: string;
  nom: string;
  email: string;
  formation: string;
  mode: StudentMode;
  statut: string;
  date: string;
  cpfStudentId?: string;
  cpfStatutDossier?: string;
}

export const CPF_STATUT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "en_attente", label: "En attente" },
  { value: "dossier_complet", label: "Dossier complet" },
  { value: "en_cours_instruction", label: "En cours d'instruction" },
  { value: "valide", label: "Validé / financé" },
  { value: "refuse", label: "Refusé" },
  { value: "termine", label: "Formation terminée" },
];

const CPF_PROGRAM_LABELS: Record<string, string> = {
  "25h": "Level Up (25h, CPF)",
  "35h": "Next Level (35h, CPF)",
};

type EnrollmentJoin = {
  created_at: string;
  users: { email: string; name: string | null } | null;
  courses: { title: string } | null;
};

type InvitationJoin = {
  email: string;
  created_at: string;
  courses: { title: string } | null;
};

/**
 * Vue unique de toutes les élèves, CPF et fonds propres confondues, dédupliquée par email
 * (une élève CPF dont le compte a aussi un accès direct n'apparaît qu'une fois, côté CPF).
 */
export async function getUnifiedStudents(): Promise<StudentRow[]> {
  const supabase = createServerSupabaseClient();

  const [{ data: cpfStudents }, { data: enrollments }, { data: invitations }] = await Promise.all([
    supabase
      .from("cpf_students")
      .select("id, nom, prenom, email, program, statut_dossier, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("course_enrollments")
      .select("created_at, users(email, name), courses(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("formation_invitations")
      .select("email, created_at, courses(title)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const cpfEmails = new Set((cpfStudents ?? []).map((s) => s.email.toLowerCase()));

  const cpfRows: StudentRow[] = (cpfStudents ?? []).map((s) => ({
    key: `cpf-${s.id}`,
    nom: `${s.prenom} ${s.nom}`,
    email: s.email,
    formation: CPF_PROGRAM_LABELS[s.program] ?? s.program,
    mode: "cpf",
    statut: s.statut_dossier,
    date: s.created_at,
    cpfStudentId: s.id,
    cpfStatutDossier: s.statut_dossier,
  }));

  const enrollmentRows: StudentRow[] = ((enrollments ?? []) as unknown as EnrollmentJoin[])
    .filter((e) => e.users && !cpfEmails.has(e.users.email.toLowerCase()))
    .map((e) => ({
      key: `enroll-${e.users!.email}-${e.courses?.title ?? ""}`,
      nom: e.users!.name ?? "—",
      email: e.users!.email,
      formation: e.courses?.title ?? "—",
      mode: "direct",
      statut: "Accès actif",
      date: e.created_at,
    }));

  const invitationRows: StudentRow[] = ((invitations ?? []) as unknown as InvitationJoin[])
    .filter((i) => !cpfEmails.has(i.email.toLowerCase()))
    .map((i) => ({
      key: `invite-${i.email}-${i.courses?.title ?? ""}`,
      nom: "—",
      email: i.email,
      formation: i.courses?.title ?? "—",
      mode: "invitation",
      statut: "Invitation envoyée",
      date: i.created_at,
    }));

  return [...cpfRows, ...enrollmentRows, ...invitationRows].sort((a, b) => b.date.localeCompare(a.date));
}
