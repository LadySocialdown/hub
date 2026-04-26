import { SignIn } from "@clerk/nextjs";

export default function ConnexionPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-[var(--sable)]">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border border-[var(--mocha-light)] rounded-2xl bg-[var(--ivoire)]",
            headerTitle: "text-[var(--cacao)] font-serif",
            formButtonPrimary: "bg-[var(--cacao)] hover:bg-[var(--mocha)] text-[var(--ivoire)]",
            footerActionLink: "text-[var(--mocha)] hover:text-[var(--cacao)]",
          },
        }}
      />
    </div>
  );
}
