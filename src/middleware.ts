import { clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/ressources(.*)",
  "/programmes(.*)",
  "/tarifs(.*)",
  "/cpf(.*)",
  "/connexion(.*)",
  "/inscription(.*)",
  "/la-petite-academie(.*)",
  "/api/webhooks/(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const user = await currentUser();
    const email = user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
    if (!isAdminEmail(email)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
