import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getEnrolledCourses } from "@/lib/formation/access";

export const metadata: Metadata = { title: "Ma formation" };

export default async function FormationPage() {
  const { userId } = await requireAuth();
  const courses = await getEnrolledCourses(userId);

  if (courses.length === 1) {
    redirect(`/dashboard/formation/${courses[0].slug}`);
  }

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
          Ma formation
        </h1>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-[var(--mocha-light)] rounded-2xl p-8 text-center text-[var(--noir)] opacity-60 text-sm">
          Tu n&apos;as pas encore accès à une formation. Si tu penses que c&apos;est une erreur,
          contacte-nous à{" "}
          <a href="mailto:contact@ladysocialdown.com" className="text-[var(--mocha)] underline">
            contact@ladysocialdown.com
          </a>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/dashboard/formation/${c.slug}`}
              className="card-lift bg-white border border-[var(--mocha-light)] shadow-warm rounded-2xl p-6 hover:border-[var(--cacao)]"
            >
              <h2
                className="text-base font-semibold text-[var(--cacao)]"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {c.title}
              </h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
