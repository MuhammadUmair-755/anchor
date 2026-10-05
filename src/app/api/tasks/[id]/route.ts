import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { TaskItem } from "@/types/models";
import { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

/**
 * PATCH /api/tasks/[id]
 * Updates task fields or toggles completion.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const supabase = createAdminClient();

    // 1. Fetch current task state to verify ownership and handle toggle
    const { data: existingTask, error: fetchErr } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .single();

    if (fetchErr || !existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Determine completion toggle
    const updates: TaskUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (body.isCompleted !== undefined) {
      updates.is_completed = Boolean(body.isCompleted);
      updates.completed_at = body.isCompleted ? new Date().toISOString() : null;
      if (body.isCompleted) {
        updates.tab_category = "completed";
      } else if (existingTask.tab_category === "completed") {
        updates.tab_category = "today";
      }
    }

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.tabCategory !== undefined) updates.tab_category = body.tabCategory;
    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.dueTime !== undefined) updates.due_time = body.dueTime;
    if (body.estimatedMinutes !== undefined) updates.estimated_minutes = body.estimatedMinutes;

    const { data: updatedTask, error: updateErr } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select("*, projects(title)")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const joinedProject = updatedTask.projects as { title?: string } | null;
    const mappedTask: TaskItem = {
      id: updatedTask.id,
      title: updatedTask.title,
      isCompleted: updatedTask.is_completed,
      priority: updatedTask.priority as TaskItem['priority'],
      category: updatedTask.category,
      categoryLabel: updatedTask.category.toUpperCase(),
      statusBadge: updatedTask.status_badge || undefined,
      dueInfo: updatedTask.due_info || undefined,
      dueDate: updatedTask.due_date || undefined,
      dueTime: updatedTask.due_time ? updatedTask.due_time.substring(0, 5) : undefined,
      projectId: updatedTask.project_id || undefined,
      projectName: joinedProject?.title || undefined,
      estimatedMinutes: updatedTask.estimated_minutes || 30,
      tabCategory: updatedTask.tab_category as TaskItem['tabCategory'],
      isFocusBlock: updatedTask.is_focus_block,
      createdAt: updatedTask.created_at,
      completedAt: updatedTask.completed_at || undefined,
    };

    return NextResponse.json(mappedTask);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
