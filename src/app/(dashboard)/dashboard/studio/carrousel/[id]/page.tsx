import { CarouselEditor } from "@/components/studio/editor/CarouselEditor";
import { loadEditor } from "@/lib/studio/page-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Créer ton carrousel · Studio de création" };

export default async function CarouselPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadEditor(id, "carrousel");
  return <CarouselEditor key={data.pub.updated_at} {...data} />;
}
