import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUDGET_CATEGORIES, currentCycle } from "@/lib/budgets";

export const dynamic = "force-dynamic";

/**
 * PUT /api/budgets
 * Body: { budgets: [{ category, amount }] } — sets this month's budget per category.
 * An amount of 0 clears the budget (stored as 0 so an older month's value isn't carried over).
 */
export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const input: unknown = body.budgets;
    if (!Array.isArray(input) || input.length === 0) {
      return NextResponse.json({ error: "budgets must be a non-empty array" }, { status: 400 });
    }

    const cycle = currentCycle();
    const rows = [];
    for (const item of input) {
      const meta = BUDGET_CATEGORIES.find((c) => c.category === item?.category);
      const amount = Number(item?.amount);
      if (!meta) {
        return NextResponse.json({ error: `Unknown category: ${item?.category}` }, { status: 400 });
      }
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: `Invalid amount for ${meta.label}` }, { status: 400 });
      }
      rows.push({
        user_id: authUser.userId,
        category: meta.category,
        label: meta.label,
        allocated_amount: Math.round(amount * 100) / 100,
        cycle,
        icon: meta.icon,
      });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("budget_envelopes")
      .upsert(rows, { onConflict: "user_id,category,cycle" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cycle });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
