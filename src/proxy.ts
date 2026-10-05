import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth/dev-session(.*)",
  "/api/seed(.*)",
]);

const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const isDev = process.env.NODE_ENV !== "production";
  const devSession = req.cookies.get("anchor_dev_session")?.value;

  // In development, if a dev session cookie is active, permit access
  if (isDev && devSession) {
    return;
  }

  if (isApiRoute(req)) {
    if (isPublicRoute(req)) {
      return;
    }
    const session = await auth();
    if (!session.userId) {
      return Response.json(
        {
          authenticated: false,
          error: "Unauthorized",
          message: "Active session JWT required for API access.",
        },
        { status: 401 }
      );
    }
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
