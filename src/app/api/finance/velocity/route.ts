import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { CashflowVelocity } from "@/types/models";

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

    const { data: transactions } = await supabase.from("transactions").select("*").eq("user_id", userId);

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
    };

    return NextResponse.json({ velocity });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
