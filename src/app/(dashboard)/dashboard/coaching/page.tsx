import type { Metadata } from "next";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { getEnrolledCourses } from "@/lib/formation/access";
import {
  FORMATION_COACHING_CALENDLY_URL,
  FORMATION_COURSE_LABELS,
  type FormationCourseSlug,
} from "@/lib/formation/constants";

export const metadata: Metadata = { title: "Coaching & réservation" };

export default async function CoachingPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const enrolled = await getEnrolledCourses(authUser.userId);

  const coachingCourses = enrolled.filter(
    (c) => c.slug in FORMATION_COACHING_CALENDLY_URL
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] font-medium text-[var(--mocha)] mb-2">
          Coaching
        </p>
        <h1
          className="text-3xl font-semibold text-[var(--cacao)]"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Réserver une session
        </h1>
      </div>

      {coachingCourses.length > 0 ? (
        <div className="space-y-14">
          {coachingCourses.map((course) => {
            const slug = course.slug as FormationCourseSlug;
            const calendlyUrl = FORMATION_COACHING_CALENDLY_URL[slug]!;
            const embedUrl = `${calendlyUrl}?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=FFFEF8&text_color=1A1410&primary_color=A47864`;
            const label = FORMATION_COURSE_LABELS[slug] ?? course.title;
            return (
              <div key={slug}>
                <h2
                  className="text-xl font-semibold text-[var(--cacao)] mb-1"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Coaching inclus — {label}
                </h2>
                <p className="text-sm text-[var(--noir)] opacity-60 mb-5">
                  Sélectionne un créneau directement dans le calendrier ci-dessous.
                </p>
                <div className="bg-white border border-[var(--mocha-light)] rounded-2xl overflow-hidden">
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="700"
                    style={{ border: 0, minHeight: 600 }}
                    title={`Réserver un coaching ${label}`}
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[var(--mocha-light)] rounded-2xl p-10 text-center space-y-4">
          <p className="text-[var(--cacao)] font-semibold text-lg" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Le coaching est inclus dans les formations Level Up et Next Level.
          </p>
          <p className="text-sm text-[var(--noir)] opacity-60 max-w-md mx-auto">
            Pour réserver une session ponctuelle — consultation flash ou mentorat — rendez-vous sur la page des accompagnements.
          </p>
          <Link
            href="/accompagnements"
            className="inline-block mt-2 text-sm font-medium text-[var(--mocha)] border border-[var(--mocha)] rounded-full px-6 py-2.5 hover:bg-[var(--mocha)] hover:text-white transition-colors"
          >
            Voir les accompagnements →
          </Link>
        </div>
      )}
    </div>
  );
}
