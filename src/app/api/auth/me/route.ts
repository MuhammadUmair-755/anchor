import { NextResponse } from "next/server";
import { getSession, getCurrentUser, getAuthToken } from "@/lib/clerk";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 * Returns authenticated user profile, session ID, and JWT token metadata.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Unauthorized",
          message: "No active session found. Please sign in.",
        },
        { status: 401 }
      );
    }

    const [user, token] = await Promise.all([
      getCurrentUser(),
      getAuthToken(),
    ]);

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      sessionId: session.sessionId,
      hasJwtToken: Boolean(token),
      user: user
        ? {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || null,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
          }
        : null,
      issuedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      {
        authenticated: false,
        error: "Internal Server Error",
        message,
      },
      { status: 500 }
    );
  }
}
