import { MobileNav } from "@/components/studio/MobileNav";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16 md:pb-0">
      {children}
      <MobileNav />
    </div>
  );
}
