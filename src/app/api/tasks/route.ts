import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseTaskInput, tabCategoryFor, toTaskItem } from "./shared";

export const dynamic = "force-dynamic";

function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 500 });
}

/** GET /api/tasks → { tasks: TaskItem[] } (newest first). */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await createAdminClient()
      .from("tasks")
      .select("*")
      .eq("user_id", authUser.userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tasks: (data || []).map(toTaskItem) });
  } catch (err: unknown) {
    return errorResponse(err);
  }
}

/** POST /api/tasks { title, category?, priority?, dueDate?, dueTime? } → TaskItem (201). */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = parseTaskInput(body, false);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const u = parsed.updates;
    const dueDate = u.due_date ?? null;

    const { data, error } = await createAdminClient()
      .from("tasks")
      .insert({
        user_id: authUser.userId,
        title: u.title as string,
        category: u.category ?? "work",
        priority: u.priority ?? "medium",
        due_date: dueDate,
        due_time: u.due_time ?? null,
        is_completed: false,
        tab_category: tabCategoryFor(false, dueDate),
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toTaskItem(data), { status: 201 });
  } catch (err: unknown) {
    return errorResponse(err);
  }
}
