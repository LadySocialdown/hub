"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/accompagnements", label: "Accompagnements" },
  { href: "/la-petite-academie", label: "La Petite Académie" },
  { href: "/ressources", label: "La Boîte à outils" },
  { href: "/tarifs", label: "Tarifs" },
];

export function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--ivoire)]/95 backdrop-blur-sm border-b border-[var(--mocha-light)] shadow-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="text-2xl font-semibold text-[var(--cacao)] tracking-wide"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Lady Socialdown
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  pathname.startsWith(link.href)
                    ? "text-[var(--cacao)]"
                    : "text-[var(--noir)] hover:text-[var(--mocha)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth — desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-[var(--noir)] hover:text-[var(--mocha)] transition-colors"
                >
                  Mon espace
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 border-2 border-[var(--mocha-light)]",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-sm font-medium text-[var(--noir)] hover:text-[var(--mocha)] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="px-4 py-2 text-sm font-medium bg-[var(--cacao)] text-[var(--ivoire)] rounded-full hover:bg-[var(--mocha)] transition-colors"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[var(--noir)]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--mocha-light)] bg-[var(--ivoire)] px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block text-sm font-medium py-2 transition-colors",
                pathname.startsWith(link.href)
                  ? "text-[var(--cacao)]"
                  : "text-[var(--noir)] hover:text-[var(--mocha)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[var(--mocha-light)] flex flex-col gap-2">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[var(--noir)] py-2"
                >
                  Mon espace
                </Link>
                <div className="py-1">
                  <UserButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[var(--noir)] py-2"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-[var(--cacao)] text-[var(--ivoire)] rounded-full text-center"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
