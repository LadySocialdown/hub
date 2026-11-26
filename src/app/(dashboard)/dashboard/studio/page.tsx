import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Planning } from "@/components/studio/planning/Planning";
import { parseDate } from "@/lib/studio/constants";
import { getBalance } from "@/lib/studio/credits";
import { isoDate, listPublications } from "@/lib/studio/publications";
import { getSettings } from "@/lib/studio/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Studio de création" };

function monday(d: Date) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ semaine?: string; nouveau?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/connexion");
  const settings = await getSettings(userId);
  if (!settings) redirect("/dashboard/studio/reglages");

  const sp = await searchParams;
  const base = sp.semaine && /^\d{4}-\d{2}-\d{2}$/.test(sp.semaine) ? parseDate(sp.semaine) : new Date();
  const start = monday(base);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const [pubs, balance] = await Promise.all([listPublications(userId, isoDate(start), isoDate(end)), getBalance(userId)]);
  const openNew = sp.nouveau === "carrousel" || sp.nouveau === "story" ? sp.nouveau : null;

  return <Planning key={`${isoDate(start)}-${openNew ?? ""}`} weekStart={isoDate(start)} initialPubs={pubs} settings={settings} balance={balance} openNew={openNew} />;
}
