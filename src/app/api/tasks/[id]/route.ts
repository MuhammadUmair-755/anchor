import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid, parseTaskInput, tabCategoryFor, toTaskItem } from "../shared";

export const dynamic = "force-dynamic";

function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * PATCH /api/tasks/[id]
 * Body: any of { title, category, priority, dueDate, dueTime, isCompleted } → TaskItem.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    const body = await req.json().catch(() => null);
    const parsed = parseTaskInput(body, true);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const updates = parsed.updates;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const isCompleted = updates.is_completed ?? existing.is_completed;
    if (updates.is_completed !== undefined && updates.is_completed !== existing.is_completed) {
      updates.completed_at = isCompleted ? new Date().toISOString() : null;
    }
    const dueDate = updates.due_date !== undefined ? updates.due_date : existing.due_date;
    updates.tab_category = tabCategoryFor(isCompleted, dueDate);

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toTaskItem(data));
  } catch (err: unknown) {
    return errorResponse(err);
  }
}

/** DELETE /api/tasks/[id] → { success, id }, 404 if the user has no such task. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    const { data, error } = await createAdminClient()
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    return errorResponse(err);
  }
}
