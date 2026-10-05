import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { seedUserData } from "@/services/seedService";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed
 * Populates real starter data into Supabase for the current user.
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const force = Boolean(body.force);

    const result = await seedUserData(authUser.userId, {
      force,
      email: authUser.email,
      fullName: authUser.fullName,
    });

    return NextResponse.json({
      success: true,
      userId: authUser.userId,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
