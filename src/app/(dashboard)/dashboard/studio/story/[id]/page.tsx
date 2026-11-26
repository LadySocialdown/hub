import { StoryEditor } from "@/components/studio/editor/StoryEditor";
import { loadEditor } from "@/lib/studio/page-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Créer ta story · Studio de création" };

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadEditor(id, "story");
  return <StoryEditor key={data.pub.updated_at} {...data} />;
}
