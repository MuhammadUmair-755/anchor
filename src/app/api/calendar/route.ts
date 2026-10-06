import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { CalendarDay, CalendarEvent, CalendarMonthData } from "@/types/models";
import { currentMonthKey, isMonthKey, monthGrid } from "@/lib/calendar";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * GET /api/calendar?month=YYYY-MM
 * Returns the Monday-first grid for that month with the user's real events,
 * tasks (by due date), transactions and notes on each day.
 */
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const month = new URL(req.url).searchParams.get("month") || currentMonthKey();
    if (!isMonthKey(month)) {
      return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 });
    }

    const grid = monthGrid(month);
    const from = grid[0].dateKey;
    const to = grid[grid.length - 1].dateKey;
    const userId = authUser.userId;
    const supabase = createAdminClient();

    const [events, tasks, transactions, notes] = await Promise.all([
      supabase.from("calendar_events").select("id, title, date, time, note").eq("user_id", userId).gte("date", from).lte("date", to).order("time", { ascending: true, nullsFirst: true }),
      supabase.from("tasks").select("id, title, due_date, is_completed").eq("user_id", userId).gte("due_date", from).lte("due_date", to),
      supabase.from("transactions").select("id, payee_or_payer, amount, date").eq("user_id", userId).gte("date", from).lte("date", to),
      supabase.from("journal_entries").select("id, title, date_key").eq("user_id", userId).gte("date_key", from).lte("date_key", to),
    ]);

    const failed = [events, tasks, transactions, notes].find((r) => r.error);
    if (failed?.error) {
      return NextResponse.json({ error: failed.error.message }, { status: 500 });
    }

    const days: CalendarDay[] = grid.map((cell) => ({
      ...cell,
      events: (events.data || [])
        .filter((e) => e.date === cell.dateKey)
        .map((e): CalendarEvent => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time ? e.time.slice(0, 5) : undefined,
          note: e.note || undefined,
        })),
      tasks: (tasks.data || [])
        .filter((t) => t.due_date === cell.dateKey)
        .map((t) => ({ id: t.id, title: t.title, isCompleted: t.is_completed })),
      transactions: (transactions.data || [])
        .filter((tx) => tx.date === cell.dateKey)
        .map((tx) => ({ id: tx.id, title: tx.payee_or_payer, amount: Number(tx.amount) })),
      notes: (notes.data || [])
        .filter((n) => n.date_key === cell.dateKey)
        .map((n) => ({ id: n.id, title: n.title })),
    }));

    const body: CalendarMonthData = { month, days };
    return NextResponse.json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/calendar  { title, date: YYYY-MM-DD, time?: HH:MM, note? }
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const { date, time, note } = body;

    if (!title || title.length > 200) {
      return NextResponse.json({ error: "Title is required (max 200 characters)" }, { status: 400 });
    }
    if (typeof date !== "string" || !DATE_RE.test(date) || isNaN(new Date(`${date}T00:00:00`).getTime())) {
      return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
    }
    if (time !== undefined && time !== null && time !== "" && (typeof time !== "string" || !TIME_RE.test(time))) {
      return NextResponse.json({ error: "time must be HH:MM (24-hour)" }, { status: 400 });
    }
    if (note !== undefined && note !== null && typeof note !== "string") {
      return NextResponse.json({ error: "note must be text" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: event, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: authUser.userId,
        title,
        date,
        time: time ? `${time}:00` : null,
        type: "event",
        note: note?.trim() || null,
      })
      .select("id, title, date, time, note")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const created: CalendarEvent = {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time ? event.time.slice(0, 5) : undefined,
      note: event.note || undefined,
    };
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
