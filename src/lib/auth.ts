import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type UserRole = "user" | "admin";

/** Seul cet email (compte Sania) a accès aux pages et actions admin — aucun autre. */
export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!email && !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase();
}

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
  const role: UserRole = isAdminEmail(email) ? "admin" : "user";

  return { userId, role };
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") throw new Error("Forbidden");
  return user;
}

/**
 * Garde d'accès pour les pages admin (Server Components) : redirige au lieu de planter.
 * Le middleware ne fait qu'un premier filtrage par rôle Clerk (edge-safe, sans appel
 * réseau) — c'est ici, en runtime Node, que l'email est vérifié strictement.
 */
export async function requireAdminPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function getSubscriptionPlan(): Promise<"starter" | "essentielle" | "vip"> {
  const { sessionClaims } = await auth();
  const plan = (sessionClaims?.metadata as { plan?: string } | undefined)?.plan;
  if (plan === "vip") return "vip";
  if (plan === "essentielle") return "essentielle";
  return "starter";
}

export { currentUser };
