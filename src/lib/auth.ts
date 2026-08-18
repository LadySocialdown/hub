import { auth, currentUser } from "@clerk/nextjs/server";

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

export async function getSubscriptionPlan(): Promise<"starter" | "essentielle" | "vip"> {
  const { sessionClaims } = await auth();
  const plan = (sessionClaims?.metadata as { plan?: string } | undefined)?.plan;
  if (plan === "vip") return "vip";
  if (plan === "essentielle") return "essentielle";
  return "starter";
}

export { currentUser };
