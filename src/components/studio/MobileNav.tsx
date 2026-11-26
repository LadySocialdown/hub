"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

/** Barre de navigation basse du studio, sous 768 px : « Semaine » et « Créer ». */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onWeek = pathname === "/dashboard/studio";
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold";
  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-[44] md:hidden" style={{ background: "rgba(43,36,34,0.35)" }} aria-hidden="true" onClick={() => setOpen(false)} />
          <div role="menu" aria-label="Créer" className="fixed inset-x-4 bottom-[76px] z-[45] flex flex-col gap-2 rounded-3xl bg-[var(--ivoire)] p-3 md:hidden" style={{ boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" }}>
            <Link role="menuitem" href="/dashboard/studio?nouveau=carrousel" onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-2xl bg-[var(--sable)] px-4 text-sm font-bold text-[var(--cacao)] no-underline">Nouveau carrousel</Link>
            <Link role="menuitem" href="/dashboard/studio?nouveau=story" onClick={() => setOpen(false)} className="flex min-h-12 items-center rounded-2xl bg-[var(--sable)] px-4 text-sm font-bold text-[var(--cacao)] no-underline">Nouvelle story</Link>
          </div>
        </>
      )}
      <nav aria-label="Studio" className="fixed inset-x-0 bottom-0 z-[45] flex border-t border-[var(--mocha-light)] bg-[var(--ivoire)] md:hidden">
        <Link href="/dashboard/studio" aria-current={onWeek ? "page" : undefined} className={`${item} no-underline ${onWeek ? "text-[var(--cacao)]" : "text-[var(--mocha)]"}`}>
          <CalendarDays size={20} aria-hidden="true" />
          Semaine
        </Link>
        <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${item} text-[var(--mocha)]`}>
          <Plus size={20} aria-hidden="true" />
          Créer
        </button>
      </nav>
    </>
  );
}
