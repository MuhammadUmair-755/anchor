import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CalendarDayCell,
  SovereignGoal,
  DayInspectorData,
  TemporalHealthMetrics,
  NewCalendarEventPayload,
} from "@/types/models";

export const dynamic = "force-dynamic";

/**
 * GET /api/calendar
 */
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const selectedDate = searchParams.get("selectedDate") || new Date().toISOString().split("T")[0];

    const supabase = createAdminClient();
    const userId = authUser.userId;

    const [
      { data: events },
      { data: tasks },
      { data: transactions },
      { data: journal },
      { data: goals },
    ] = await Promise.all([
      supabase.from("calendar_events").select("*").eq("user_id", userId),
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("journal_entries").select("*").eq("user_id", userId),
      supabase.from("sovereign_goals").select("*").eq("user_id", userId),
    ]);

    // Build 35-day grid for calendar
    const curr = new Date(selectedDate);
    const year = curr.getFullYear();
    const month = curr.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sun
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1)); // Start Monday

    const todayStr = new Date().toISOString().split("T")[0];

    const days: CalendarDayCell[] = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = d.toISOString().split("T")[0];

      // Day aggregated metrics
      const dayTasks = (tasks || []).filter((t) => t.due_date === dateKey);
      const dayTxs = (transactions || []).filter((tx) => tx.date === dateKey);
      const hasJ = (journal || []).some((j) => j.date_key === dateKey);
      const dayEvent = (events || []).find((e) => e.date === dateKey);

      let financeSum = 0;
      dayTxs.forEach((tx) => {
        financeSum += Number(tx.amount);
      });

      days.push({
        dateKey,
        dayNumber: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        isToday: dateKey === todayStr,
        financeAmount: financeSum !== 0 ? financeSum : undefined,
        tasksDone: dayTasks.filter((t) => t.is_completed).length,
        tasksTotal: dayTasks.length,
        hasJournal: hasJ,
        specialNote: dayEvent?.title || undefined,
        monthLabel: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }

    // Sovereign goals mapping
    const sovereignGoals: SovereignGoal[] = (goals || []).map((g) => ({
      id: g.id,
      title: g.title,
      subtitle: g.subtitle || "",
      targetHorizon: g.target_horizon || "Target",
      progressPercentage: g.progress_percentage,
      achievedMetric: g.achieved_metric || "",
      gapMetric: g.gap_metric || "",
      meterColor: g.meter_color || "#3b82f6",
    }));

    // Day Inspector Data for selectedDate
    const inspDate = new Date(selectedDate);
    const inspTasks = (tasks || []).filter((t) => t.due_date === selectedDate);
    const inspTxs = (transactions || []).filter((tx) => tx.date === selectedDate);
    const inspJournal = (journal || []).find((j) => j.date_key === selectedDate);

    let ledgerTotal = 0;
    const ledgerItems = inspTxs.map((tx) => {
      const amt = Number(tx.amount);
      ledgerTotal += amt;
      return {
        category: tx.payee_or_payer,
        amount: amt,
      };
    });

    const dayInspector: DayInspectorData = {
      dateTitle: inspDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      subtitle: "Day Nexus Summary",
      tasksDone: inspTasks.filter((t) => t.is_completed).length,
      tasksPending: inspTasks.filter((t) => !t.is_completed).length,
      tasksList: inspTasks.map((t) => ({ id: t.id, title: t.title, isCompleted: t.is_completed })),
      ledgerItems,
      ledgerTotal,
      journalQuote: inspJournal?.quote || "Restraint is power. When life gets chaotic, tighten the system.",
      journalTime: "21:40",
      cadenceDelta: "+2.4% vs last cycle",
    };

    const temporalHealth: TemporalHealthMetrics = {
      monthName: curr.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      operationalEquilibriumTitle: "Optimal Equilibrium",
      operationalEquilibriumSubtext: "Daily commitments synchronized with long-term sovereign goals.",
      tasksResolvedCount: (tasks || []).filter((t) => t.is_completed).length,
      tasksTotalCount: (tasks || []).length,
      netBalanceMtd: ledgerTotal,
      currency: "INR",
    };

    return NextResponse.json({
      days,
      sovereignGoals,
      dayInspector,
      temporalHealth,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/calendar
 * Adds a new calendar event.
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: NewCalendarEventPayload = await req.json();
    const { title, date, type, amount, note } = payload;

    if (!title || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: event, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: authUser.userId,
        title: title.trim(),
        date,
        type: type || "event",
        amount: amount ? Number(amount) : null,
        note: note || null,
        is_reconciled: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
