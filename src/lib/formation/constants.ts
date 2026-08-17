export const APP_ORIGIN = "https://app.ladysocialdown.com";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormationCourseSlug = "petite-academie" | "level-up" | "next-level";

export const FORMATION_COURSE_LABELS: Record<FormationCourseSlug, string> = {
  "petite-academie": "La Petite Académie",
  "level-up": "Level Up",
  "next-level": "Next Level",
};

/** Coaching post-formation réservable en autonomie (3 mois Next Level / 1 mois Level Up). */
export const FORMATION_COACHING_CALENDLY_URL: Partial<Record<FormationCourseSlug, string>> = {
  "level-up": "https://calendly.com/contact-ladysocialdown/coaching-level-up",
  "next-level": "https://calendly.com/contact-ladysocialdown/coaching-level-up-clone",
};

/** Offres pour lesquelles Sania déclenche l'accès manuellement (post consultation flash). */
export const MANUAL_GRANT_COURSE_SLUGS: FormationCourseSlug[] = ["level-up", "next-level"];
