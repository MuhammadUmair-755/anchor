import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "../../tasks/shared";

export const dynamic = "force-dynamic";

/** DELETE /api/calendar/[id] — removes one of the user's events. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
