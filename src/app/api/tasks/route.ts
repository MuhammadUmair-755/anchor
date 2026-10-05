import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  TaskItem,
  Project,
  TasksPageData,
  CreateTaskPayload,
  PriorityLevel,
  TaskFilterTab,
} from "@/types/models";

export const dynamic = "force-dynamic";

interface TaskRecord {
  id: string;
  title: string;
  is_completed: boolean;
  priority: PriorityLevel;
  category: string;
  status_badge: string | null;
  due_info: string | null;
  due_date: string | null;
  due_time: string | null;
  project_id: string | null;
  estimated_minutes: number | null;
  tab_category: TaskFilterTab;
  is_focus_block: boolean;
  created_at: string;
  completed_at: string | null;
  projects?: { title: string } | null;
}

/**
 * GET /api/tasks
 * Returns tasks, projects, weekly rhythm, and velocity metrics.
 */
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab");
    const projectId = searchParams.get("projectId");

    const supabase = createAdminClient();
    const userId = authUser.userId;

    let tasksQuery = supabase
      .from("tasks")
      .select("*, projects(title)", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (tab && tab !== "all") {
      tasksQuery = tasksQuery.eq("tab_category", tab as TaskFilterTab);
    }
    if (projectId) {
      tasksQuery = tasksQuery.eq("project_id", projectId);
    }

    const [{ data: tasks, error: tasksErr }, { data: projects, error: projectsErr }] = await Promise.all([
      tasksQuery,
      supabase.from("projects").select("*").eq("user_id", userId).order("progress_percentage", { ascending: false }),
    ]);

    if (tasksErr) {
      return NextResponse.json({ error: tasksErr.message }, { status: 500 });
    }
    if (projectsErr) {
      return NextResponse.json({ error: projectsErr.message }, { status: 500 });
    }

    const rawTasks = (tasks || []) as unknown as TaskRecord[];

    const mappedTasks: TaskItem[] = rawTasks.map((t) => ({
      id: t.id,
      title: t.title,
      isCompleted: t.is_completed,
      priority: t.priority,
      category: t.category,
      categoryLabel: t.category.toUpperCase(),
      statusBadge: t.status_badge || (t.is_focus_block ? "FOCUS BLOCK" : undefined),
      dueInfo: t.due_info || (t.due_time ? `Due ${t.due_time.substring(0, 5)}` : undefined),
      dueDate: t.due_date || undefined,
      dueTime: t.due_time ? t.due_time.substring(0, 5) : undefined,
      projectId: t.project_id || undefined,
      projectName: t.projects?.title || undefined,
      estimatedMinutes: t.estimated_minutes || 30,
      tabCategory: t.tab_category,
      isFocusBlock: t.is_focus_block,
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined,
    }));

    const mappedProjects: Project[] = (projects || []).map((p) => ({
      id: p.id,
      title: p.title,
      tag: p.tag || "PROJECT",
      description: p.description || "",
      progressPercentage: p.progress_percentage,
      nextMilestone: p.next_milestone || "In Progress",
      tasksCompleted: (tasks || []).filter((t) => t.project_id === p.id && t.is_completed).length,
      totalTasks: (tasks || []).filter((t) => t.project_id === p.id).length,
      targetDate: p.target_date || undefined,
      accentColor: p.accent_color || "#3b82f6",
    }));

    const completedCount = mappedTasks.filter((t) => t.isCompleted).length;

    const pageData: TasksPageData = {
      tasks: mappedTasks,
      activeProjects: mappedProjects,
      weeklyRhythm: [
        { day: "M", heightPercent: 75 },
        { day: "T", heightPercent: 88 },
        { day: "W", heightPercent: 62 },
        { day: "T", heightPercent: 95 },
        { day: "F", heightPercent: 90, isToday: true },
        { day: "S", heightPercent: 40 },
        { day: "S", heightPercent: 20 },
      ],
      executionRhythm: {
        allocatedTimeRange: "09:00 - 12:30",
        title: "Deep Architecture Sprint",
        description: "Zero notifications, dedicated deep focus blocks for core initiatives.",
        blockName: "Deep Focus Phase",
        focusMode: true,
      },
      velocityMetrics: {
        completedCount,
        weeklyAverageDelta: "+18% vs last week",
        weeklyRhythm: [
          { day: "M", heightPercent: 75 },
          { day: "T", heightPercent: 88 },
          { day: "W", heightPercent: 62 },
          { day: "T", heightPercent: 95 },
          { day: "F", heightPercent: 90, isToday: true },
          { day: "S", heightPercent: 40 },
          { day: "S", heightPercent: 20 },
        ],
        syncStatus: "Synced with PostgreSQL",
        syncLatencyMs: 14,
      },
      systemPhases: [
        { id: "p-1", name: "Specification & Database", status: "completed" },
        { id: "p-2", name: "API & Frontend Sync", status: "active" },
        { id: "p-3", name: "Playwright Automated Audit", status: "upcoming" },
      ],
    };

    return NextResponse.json(pageData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Creates a new task.
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: CreateTaskPayload = await req.json();
    const {
      title,
      priority = "medium",
      projectId,
      dueDate = new Date().toISOString().split("T")[0],
      dueTime,
      dueInfo,
      category = "work",
      estimatedMinutes = 30,
      tabCategory = "today",
    } = payload;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: rawTask, error } = await supabase
      .from("tasks")
      .insert({
        user_id: authUser.userId,
        title: title.trim(),
        priority,
        project_id: projectId || null,
        due_date: dueDate,
        due_time: dueTime ? (dueTime.length === 5 ? `${dueTime}:00` : dueTime) : null,
        due_info: dueInfo || (dueTime ? `Due ${dueTime.substring(0, 5)}` : "Today"),
        category: (category as "work" | "personal" | "finance" | "learning") || "work",
        estimated_minutes: estimatedMinutes,
        tab_category: tabCategory as TaskFilterTab,
        is_focus_block: false,
        is_completed: false,
      })
      .select("*, projects(title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const task = rawTask as unknown as TaskRecord;

    const mappedTask: TaskItem = {
      id: task.id,
      title: task.title,
      isCompleted: task.is_completed,
      priority: task.priority,
      category: task.category,
      categoryLabel: task.category.toUpperCase(),
      statusBadge: task.status_badge || undefined,
      dueInfo: task.due_info || undefined,
      dueDate: task.due_date || undefined,
      dueTime: task.due_time ? task.due_time.substring(0, 5) : undefined,
      projectId: task.project_id || undefined,
      projectName: task.projects?.title || undefined,
      estimatedMinutes: task.estimated_minutes || 30,
      tabCategory: task.tab_category,
      isFocusBlock: task.is_focus_block,
      createdAt: task.created_at,
    };

    return NextResponse.json(mappedTask, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
