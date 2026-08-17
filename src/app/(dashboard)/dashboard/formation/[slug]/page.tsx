import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getCourseWithProgress } from "@/lib/formation/access";
import { FORMATION_COACHING_CALENDLY_URL, type FormationCourseSlug } from "@/lib/formation/constants";
import { CourseViewer } from "./CourseViewer";

export const metadata: Metadata = { title: "Ma formation" };

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await requireAuth();
  const course = await getCourseWithProgress(userId, slug);
  if (!course) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Espace formation
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {course.title}
        </h1>
      </div>

      <CourseViewer
        course={course}
        calendlyUrl={FORMATION_COACHING_CALENDLY_URL[slug as FormationCourseSlug]}
      />
    </div>
  );
}
