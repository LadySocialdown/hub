import type { Metadata } from "next";
import { getDashboardStatus } from "@/lib/instagram/scheduler";
import { requireAdminPage } from "@/lib/auth";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = { title: "Instagram — Lady Socialdown" };
export const dynamic = "force-dynamic";
// Windsor.ai + Claude peuvent prendre plus que les 10s par défaut de Vercel — s'applique
// aussi à la Server Action "Analyser maintenant" invoquée depuis cette page.
export const maxDuration = 60;

export default async function InstagramAnalyticsPage() {
  await requireAdminPage();
  const status = await getDashboardStatus();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Dashboard
        initialReport={status.lastReport}
        reportHistory={status.reportHistory}
        nextDueDate={status.nextDueDate}
        nextDueLabel={status.nextDueLabel}
      />
    </div>
  );
}
