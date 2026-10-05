import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
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

    // Fetch accounts, transactions, budget envelopes, tasks, goals in parallel
    const [
      { data: accounts },
      { data: transactions },
      { data: envelopes },
      { data: tasks },
      { data: goals },
      { data: maxims },
    ] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("budget_envelopes").select("*").eq("user_id", userId),
      supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("sovereign_goals").select("*").eq("user_id", userId).limit(1),
      supabase.from("pinned_maxims").select("*").eq("user_id", userId).eq("is_active", true).limit(1),
    ]);

    // 1. Calculate Liquidity
    const liquidAccounts = (accounts || []).filter((a) => a.type !== "credit");
    const totalLiquidity = liquidAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

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
    const budgetEnvelopes: BudgetEnvelope[] = (envelopes || []).map((env) => {
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
    const dailyTasks: DailyTask[] = (tasks || [])
      .filter((t) => t.tab_category === "today" || t.due_date === todayStr)
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

    // 7. Mindset Goal
    const primaryGoal = goals?.[0];
    const maxim = maxims?.[0];

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
      liquidityTrendPercent: 8.4,
      currency: "INR",
      monthlyInflow,
      monthlyInflowTrendPercent: 12.5,
      inflowSourcesCount: (transactions || []).filter((tx) => Number(tx.amount) > 0).length,
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
      mindsetGoal: {
        quote: maxim?.quote || "Restraint is power. When life gets chaotic, tighten the system.",
        quoteAuthor: maxim?.attribution || "Anchor Codex",
        entryTime: "08:00 AM",
        goalTitle: primaryGoal?.title || "Liquid Sovereign Reserve",
        targetAmount: 3000000,
        currentAmount: totalLiquidity,
        achievedPercentage: primaryGoal?.progress_percentage || 82,
        targetDate: primaryGoal?.target_date || "Dec 31, 2026",
      },
    };

    return NextResponse.json(overviewData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
