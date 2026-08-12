import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lady Socialdown — Formation Réseaux Sociaux pour Entrepreneurs",
    template: "%s | Lady Socialdown",
  },
  description:
    "Formations et mentorats CPF pour entrepreneurs qui veulent transformer leurs réseaux sociaux en vraie stratégie de vente. Next Level, Level Up, La Petite Académie.",
  metadataBase: new URL("https://app.ladysocialdown.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Lady Socialdown",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="fr"
        className={`${cormorant.variable} ${dmSans.variable} h-full`}
      >
        <body className="min-h-full flex flex-col bg-[var(--ivoire)] text-[var(--noir)]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
