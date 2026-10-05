import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/dev-session
 * Establishes dev session and redirects to redirectUrl or "/"
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_anchor_commander";
    const redirectUrl = searchParams.get("redirect") || "/";

    const cookieStore = await cookies();
    cookieStore.set("anchor_dev_session", userId, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/auth/dev-session
 * Sets development test session cookie for local development and Playwright testing.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || "user_anchor_commander";

    const cookieStore = await cookies();
    cookieStore.set("anchor_dev_session", userId, {
      path: "/",
      httpOnly: false, // Accessible to client scripts if needed
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      userId,
      message: "Development test session established.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/dev-session
 * Clears development test session cookie.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("anchor_dev_session");
    return NextResponse.json({ success: true, message: "Dev session cleared." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
