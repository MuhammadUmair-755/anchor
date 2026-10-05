import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { Account } from "@/types/models";

export const dynamic = "force-dynamic";

/**
 * GET /api/finance/accounts
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", authUser.userId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedAccounts: Account[] = (accounts || []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type as Account['type'],
      institution: a.institution || "Bank",
      accountNumberMasked: a.account_number_masked || "•••• 0000",
      balance: Number(a.balance),
      currency: a.currency as Account['currency'],
      status: a.status as Account['status'],
      trendLabel: a.trend_label || undefined,
      creditLimit: a.credit_limit ? Number(a.credit_limit) : undefined,
      paymentDueDate: a.payment_due_date || undefined,
      lastReconciledAt: a.last_reconciled_at || a.updated_at,
      updatedAt: a.updated_at,
    }));

    return NextResponse.json(mappedAccounts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/finance/accounts
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, institution, balance, currency = "INR", creditLimit } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: account, error } = await supabase
      .from("accounts")
      .insert({
        user_id: authUser.userId,
        name,
        type,
        institution: institution || name,
        balance: Number(balance) || 0,
        currency,
        credit_limit: creditLimit ? Number(creditLimit) : null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(account, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
