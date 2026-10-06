import { TaskItem } from "@/types/models";
import { Database } from "@/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export const TASK_CATEGORIES = ["work", "personal", "finance", "learning"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

/** Local YYYY-MM-DD. */
export function localISODate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Keeps the legacy tab_category column consistent (the overview still reads it). */
export function tabCategoryFor(isCompleted: boolean, dueDate: string | null, today = localISODate()): TaskRow["tab_category"] {
  if (isCompleted) return "completed";
  if (!dueDate) return "backlog";
  if (dueDate < today) return "overdue";
  return dueDate === today ? "today" : "upcoming";
}

function isValidDate(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(v);
}

/**
 * Validates a create (partial=false) or patch (partial=true) body.
 * Returns DB columns to write, or an error message for a 400.
 */
export function parseTaskInput(body: unknown, partial: boolean): { updates: TaskUpdate } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Request body must be a JSON object" };
  const b = body as Record<string, unknown>;
  const updates: TaskUpdate = {};
  const has = (k: string) => b[k] !== undefined;

  if (has("title") || !partial) {
    if (typeof b.title !== "string" || !b.title.trim()) return { error: "Title is required" };
    if (b.title.trim().length > 200) return { error: "Title must be 200 characters or fewer" };
    updates.title = b.title.trim();
  }
  if (has("category")) {
    if (!TASK_CATEGORIES.includes(b.category as never)) return { error: `Category must be one of: ${TASK_CATEGORIES.join(", ")}` };
    updates.category = b.category as TaskRow["category"];
  }
  if (has("priority")) {
    if (!TASK_PRIORITIES.includes(b.priority as never)) return { error: `Priority must be one of: ${TASK_PRIORITIES.join(", ")}` };
    updates.priority = b.priority as TaskRow["priority"];
  }
  if (has("dueDate")) {
    if (b.dueDate !== null && b.dueDate !== "" && (typeof b.dueDate !== "string" || !isValidDate(b.dueDate))) {
      return { error: "Due date must be YYYY-MM-DD or null" };
    }
    updates.due_date = (b.dueDate as string) || null;
  }
  if (has("dueTime")) {
    if (b.dueTime !== null && b.dueTime !== "" && (typeof b.dueTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(b.dueTime))) {
      return { error: "Due time must be HH:MM (24h) or null" };
    }
    updates.due_time = (b.dueTime as string) || null;
  }
  if (has("isCompleted")) {
    if (typeof b.isCompleted !== "boolean") return { error: "isCompleted must be a boolean" };
    updates.is_completed = b.isCompleted;
  }
  if (has("dueDate") || has("dueTime")) updates.due_info = null; // label is derived from date/time now
  return { updates };
}

export function toTaskItem(t: TaskRow): TaskItem {
  const dueTime = t.due_time ? t.due_time.substring(0, 5) : undefined;
  return {
    id: t.id,
    title: t.title,
    isCompleted: t.is_completed,
    priority: t.priority,
    category: t.category,
    categoryLabel: t.category.toUpperCase(),
    dueInfo: t.due_info || (dueTime ? `Due ${dueTime}` : undefined),
    dueDate: t.due_date || undefined,
    dueTime,
    tabCategory: t.tab_category,
    createdAt: t.created_at,
    completedAt: t.completed_at || undefined,
  };
}

/** Non-uuid ids can't exist; checking avoids a Postgres cast error (500). */
export const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
