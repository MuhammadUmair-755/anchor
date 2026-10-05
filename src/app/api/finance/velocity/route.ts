import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { CashflowVelocity, RecurringObligation } from "@/types/models";

export const dynamic = "force-dynamic";

/**
 * GET /api/finance/velocity
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const userId = authUser.userId;

    const [{ data: transactions }, { data: recurring }] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", userId),
      supabase.from("recurring_obligations").select("*").eq("user_id", userId).order("amount", { ascending: false }),
    ]);

    let totalInflow = 0;
    let totalOutflow = 0;
    let inflowCount = 0;
    let outflowCount = 0;

    (transactions || []).forEach((tx) => {
      const amt = Number(tx.amount);
      if (amt > 0) {
        totalInflow += amt;
        inflowCount++;
      } else {
        totalOutflow += Math.abs(amt);
        outflowCount++;
      }
    });

    const netSavings = Math.max(0, totalInflow - totalOutflow);
    const retentionRate = totalInflow > 0 ? Math.round((netSavings / totalInflow) * 100) : 0;

    const velocity: CashflowVelocity = {
      cycleDay: new Date().getDate(),
      cycleTotalDays: 30,
      totalInflow,
      totalOutflow,
      netSavings,
      retentionRate,
      targetRetentionRate: 65,
      inflowCount,
      outflowCount,
      hotspots: [
        {
          id: "hotspot-1",
          title: "Fixed Commitments Containment",
          metric: `${Math.round((totalOutflow / (totalInflow || 1)) * 100)}% burn rate`,
          severity: retentionRate >= 50 ? "info" : "warning",
        },
        {
          id: "hotspot-2",
          title: "Net Treasury Retention",
          metric: `${retentionRate}% retained`,
          severity: retentionRate >= 65 ? "info" : "warning",
        },
      ],
    };

    const mappedRecurring: RecurringObligation[] = (recurring || []).map((r) => ({
      id: r.id,
      name: r.name,
      amount: Number(r.amount),
      currency: r.currency as RecurringObligation['currency'],
      billingCycle: r.billing_cycle as RecurringObligation['billingCycle'],
      renewalNotice: r.renewal_notice || "Active",
      status: r.status as RecurringObligation['status'],
      category: r.category as RecurringObligation['category'],
      icon: r.icon || "SubscriptionsOutlined",
    }));

    return NextResponse.json({
      velocity,
      recurring: mappedRecurring,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
