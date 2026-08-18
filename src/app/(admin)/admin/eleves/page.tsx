import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { getUnifiedStudents } from "@/lib/students/list";
import { StudentsTable } from "./StudentsTable";

export const metadata: Metadata = { title: "Élèves — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminElevesPage() {
  await requireAdminPage();
  const students = await getUnifiedStudents();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace formation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Élèves
        </h1>
        <p className="text-sm text-[var(--noir)] opacity-60 mt-1">
          CPF et fonds propres confondus — {students.length} élève{students.length > 1 ? "s" : ""} au total.
        </p>
      </div>

      <StudentsTable students={students} />
    </div>
  );
}
