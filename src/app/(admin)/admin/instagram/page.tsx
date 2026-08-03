import type { Metadata } from "next";
import { getDashboardStatus } from "@/lib/instagram/scheduler";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = { title: "Instagram — Lady Social" };
export const dynamic = "force-dynamic";

export default async function InstagramAnalyticsPage() {
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
