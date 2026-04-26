import { auth, currentUser } from "@clerk/nextjs/server";

export type UserRole = "user" | "admin";

export async function getAuthUser() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  const role = ((sessionClaims?.metadata as { role?: string } | undefined)?.role ?? "user") as UserRole;
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
