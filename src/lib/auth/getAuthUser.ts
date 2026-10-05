import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export interface AuthUser {
  userId: string;
  email: string | null;
  fullName: string;
  imageUrl: string | null;
  isDevUser: boolean;
}

/**
 * Resolves current user identity from Clerk authentication session,
 * falling back to local development/test session if in development mode.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await auth();
    if (session.userId) {
      const user = await currentUser();
      const email = user?.primaryEmailAddress?.emailAddress || null;
      const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Anchor Operator";
      const imageUrl = user?.imageUrl || null;

      return {
        userId: session.userId,
        email,
        fullName,
        imageUrl,
        isDevUser: false,
      };
    }
  } catch {
    // Non-Clerk context or SSR edge
  }

  // Fallback in development mode
  if (process.env.NODE_ENV !== "production") {
    try {
      const cookieStore = await cookies();
      const devSession = cookieStore.get("anchor_dev_session")?.value;
      if (devSession) {
        return {
          userId: devSession,
          email: "commander@anchor.io",
          fullName: "Anchor Commander",
          imageUrl: null,
          isDevUser: true,
        };
      }
      // Default dev fallback if running local server tests
      return {
        userId: "user_anchor_commander",
        email: "commander@anchor.io",
        fullName: "Anchor Commander",
        imageUrl: null,
        isDevUser: true,
      };
    } catch {
      // Cookies not accessible in current context
    }
  }

  return null;
}
