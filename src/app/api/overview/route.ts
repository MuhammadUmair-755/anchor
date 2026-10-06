import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { localISODate } from "../tasks/shared";
import { ExecutiveOverviewData, OutflowSector, BudgetEnvelope, DailyTask, TodayDebitItem } from "@/types/models";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  food_dining: "#f59e0b",
  housing_utilities: "#3b82f6",
  transport_transit: "#10b981",
  shopping_gear: "#8b5cf6",
  health_wellness: "#ec4899",
  knowledge_subs: "#06b6d4",
  consulting_inflow: "#10b981",
  salary_payroll: "#10b981",
  other: "#64748b",
};

const CATEGORY_LABELS: Record<string, string> = {
  food_dining: "Food & Dining",
  housing_utilities: "Housing & Utilities",
  transport_transit: "Transport & Transit",
  shopping_gear: "Shopping & Gear",
  health_wellness: "Health & Wellness",
  knowledge_subs: "Knowledge & Subs",
  consulting_inflow: "Consulting Inflow",
  salary_payroll: "Salary Payroll",
  other: "Other Outflows",
};

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const userId = authUser.userId;

    // Fetch balance, transactions, budget envelopes and tasks in parallel
    const [
      { data: profile },
      { data: transactions },
      { data: envelopes },
      { data: tasks },
    ] = await Promise.all([
      supabase.from("profiles").select("balance").eq("id", userId).maybeSingle(),
      supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("budget_envelopes").select("*").eq("user_id", userId),
      supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    ]);

    // 1. Liquidity = the user's single balance
    const totalLiquidity = Number(profile?.balance ?? 0);

    // 2. Inflows and Expenses (Outflows)
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonthStr = todayStr.substring(0, 7);

    let monthlyInflow = 0;
    let totalExpenses = 0;
    const categoryExpensesMap: Record<string, number> = {};

    (transactions || []).forEach((tx) => {
      const txMonth = (tx.date || "").substring(0, 7);
      const amt = Number(tx.amount);
      if (txMonth === currentMonthStr) {
        if (amt > 0) {
          monthlyInflow += amt;
        } else {
          const absAmt = Math.abs(amt);
          totalExpenses += absAmt;
          categoryExpensesMap[tx.category] = (categoryExpensesMap[tx.category] || 0) + absAmt;
        }
      }
    });

    const netRetained = Math.max(0, monthlyInflow - totalExpenses);
    const retentionRatePercent = monthlyInflow > 0 ? Math.round((netRetained / monthlyInflow) * 100) : 0;

    // 3. Outflow Sectors (Donut chart data)
    let cumulativeDashOffset = 0;
    const outflowSectors: OutflowSector[] = Object.entries(categoryExpensesMap).map(([cat, amt]) => {
      const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
      const strokeDashOffset = -cumulativeDashOffset;
      cumulativeDashOffset += pct;
      return {
        id: `sector-${cat}`,
        category: cat as OutflowSector['category'],
        label: CATEGORY_LABELS[cat] || cat,
        percentage: pct,
        amount: amt,
        currency: "INR",
        color: CATEGORY_COLORS[cat] || "#94a3b8",
        strokeDashArray: `${pct} ${100 - pct}`,
        strokeDashOffset,
      };
    });

    // 4. Budget Envelopes
    // A budget carries forward month to month: per category use the latest cycle up to this month.
    const latestByCategory = new Map<string, NonNullable<typeof envelopes>[number]>();
    for (const env of envelopes || []) {
      if (env.cycle > currentMonthStr) continue;
      const prev = latestByCategory.get(env.category);
      if (!prev || env.cycle > prev.cycle) latestByCategory.set(env.category, env);
    }
    const activeEnvelopes = [...latestByCategory.values()].filter((env) => Number(env.allocated_amount) > 0);

    const budgetEnvelopes: BudgetEnvelope[] = activeEnvelopes.map((env) => {
      const spent = categoryExpensesMap[env.category] || 0;
      const allocated = Number(env.allocated_amount);
      const burnPct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      let burnRateStatus: "normal" | "contained" | "alert" | "exceeded" = "normal";
      if (burnPct > 100) burnRateStatus = "exceeded";
      else if (burnPct > 80) burnRateStatus = "alert";
      else if (burnPct > 50) burnRateStatus = "contained";

      return {
        id: env.id,
        category: env.category as BudgetEnvelope['category'],
        label: env.label,
        allocatedAmount: allocated,
        spentAmount: spent,
        currency: env.currency as BudgetEnvelope['currency'],
        burnRateStatus,
        burnPercentage: burnPct,
        bufferRemaining: Math.max(0, allocated - spent),
        cycle: env.cycle,
        icon: env.icon || "SavingsOutlined",
      };
    });

    const budgetCap = budgetEnvelopes.reduce((acc, e) => acc + e.allocatedAmount, 0);
    const totalSpent = budgetEnvelopes.reduce((acc, e) => acc + e.spentAmount, 0);

    // 5. Daily Tasks
    const localDay = localISODate();
    const dailyTasks: DailyTask[] = (tasks || [])
      // Due today, plus anything overdue that is still open
      .filter((t) => !!t.due_date && (t.due_date === localDay || (t.due_date < localDay && !t.is_completed)))
      .map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category as DailyTask['category'],
        categoryLabel: t.category.toUpperCase(),
        priority: t.priority as DailyTask['priority'],
        isCompleted: t.is_completed,
        dueInfo: t.due_info || (t.due_time ? `Due ${t.due_time.substring(0, 5)}` : "Today"),
        createdAt: t.created_at,
        completedAt: t.completed_at || undefined,
      }));

    // 6. Today Debits
    const todayDebits: TodayDebitItem[] = (transactions || [])
      .filter((tx) => tx.date === todayStr && Number(tx.amount) < 0)
      .map((tx) => ({
        id: tx.id,
        title: tx.payee_or_payer,
        category: CATEGORY_LABELS[tx.category] || tx.category,
        paymentMethod: (tx.payment_method || "card").toUpperCase(),
        amount: Math.abs(Number(tx.amount)),
        currency: tx.currency as TodayDebitItem['currency'],
        time: tx.time ? tx.time.substring(0, 5) : "Today",
        icon: "ReceiptOutlined",
      }));

    const overviewData: ExecutiveOverviewData = {
      greeting: "Welcome back,",
      userName: authUser.fullName,
      systemStatus: "steady",
      dateDisplay: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      totalLiquidity,
      currency: "INR",
      monthlyInflow,
      inflowSourcesCount: (transactions || []).filter((tx) => Number(tx.amount) > 0 && (tx.date || "").startsWith(currentMonthStr)).length,
      totalExpenses,
      expensesBurnRatePercent: monthlyInflow > 0 ? Math.round((totalExpenses / monthlyInflow) * 100) : 0,
      netRetained,
      retentionRatePercent,
      outflowSectors,
      totalSpent,
      budgetCap,
      budgetEnvelopes,
      dailyTasks,
      todayDebits,
    };

    return NextResponse.json(overviewData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
