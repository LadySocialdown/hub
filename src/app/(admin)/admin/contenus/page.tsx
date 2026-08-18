import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { getAllCoursesWithModules } from "@/lib/formation/access";
import { ModuleEditor } from "./ModuleEditor";

export const metadata: Metadata = { title: "Contenus — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminContenusPage() {
  await requireAdminPage();
  const courses = await getAllCoursesWithModules();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace formation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Contenus des modules
        </h1>
        <p className="text-sm text-[var(--noir)] opacity-60 mt-1">
          Vidéo YouTube et ressources téléchargeables, par module.
        </p>
      </div>

      {courses.map((course) => (
        <div key={course.id} className="space-y-4">
          <h2
            className="text-xl font-semibold text-[var(--cacao)]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {course.title}
          </h2>
          <div className="space-y-4">
            {course.modules.map((m) => (
              <ModuleEditor key={m.id} module={m} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
