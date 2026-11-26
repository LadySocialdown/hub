import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/studio/SettingsForm";
import { defaultSettings, getSettings } from "@/lib/studio/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes réglages · Studio de création" };

export default async function StudioSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/connexion");
  const settings = await getSettings(userId);
  return <SettingsForm initial={settings ?? defaultSettings(userId)} isNew={!settings} />;
}
