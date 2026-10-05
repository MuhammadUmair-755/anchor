import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { Transaction, PaginatedTransactionsResponse } from "@/types/models";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  food_dining: "Food & Dining",
  housing_utilities: "Housing & Utilities",
  transport_transit: "Transport & Transit",
  shopping_gear: "Shopping & Gear",
  health_wellness: "Health & Wellness",
  knowledge_subs: "Knowledge & Subs",
  consulting_inflow: "Consulting Inflow",
  salary_payroll: "Salary Payroll",
  other: "Other Outflow",
};

/**
 * GET /api/finance/transactions
 */
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10));
    const category = searchParams.get("category");
    const accountId = searchParams.get("accountId");
    const flowType = searchParams.get("flowType");
    const selectedMonth = searchParams.get("selectedMonth");
    const searchQuery = searchParams.get("searchQuery");
    const sortBy = searchParams.get("sortBy") || "date_desc";

    const supabase = createAdminClient();

    // Query transactions with joined accounts
    let query = supabase
      .from("transactions")
      .select("*, accounts!transactions_account_id_fkey(name)", { count: "exact" })
      .eq("user_id", authUser.userId);

    if (category && category !== "all") {
      query = query.eq("category", category as Transaction['category']);
    }
    if (accountId && accountId !== "all") {
      query = query.eq("account_id", accountId);
    }
    if (flowType && flowType !== "all") {
      query = query.eq("flow_type", flowType as Transaction['flowType']);
    }
    if (selectedMonth && selectedMonth !== "all") {
      // Month format: YYYY-MM
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      if (!isNaN(year) && !isNaN(month)) {
        const lastDay = new Date(year, month, 0).getDate();
        const startOfMonth = `${selectedMonth}-01`;
        const endOfMonth = `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;
        query = query.gte("date", startOfMonth).lte("date", endOfMonth);
      }
    }
    if (searchQuery) {
      query = query.or(`payee_or_payer.ilike.%${searchQuery}%,note.ilike.%${searchQuery}%`);
    }

    // Sorting
    if (sortBy === "date_asc") {
      query = query.order("date", { ascending: true }).order("time", { ascending: true });
    } else if (sortBy === "amount_desc") {
      query = query.order("amount", { ascending: false });
    } else if (sortBy === "amount_asc") {
      query = query.order("amount", { ascending: true });
    } else {
      // default: date_desc
      query = query.order("date", { ascending: false }).order("created_at", { ascending: false });
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: transactions, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Compute summary totals for all matching transactions
    let totalInflow = 0;
    let totalOutflow = 0;

    const mappedTransactions: Transaction[] = (transactions || []).map((tx) => {
      const amt = Number(tx.amount);
      if (amt > 0) totalInflow += amt;
      else totalOutflow += Math.abs(amt);

      const joinedAccount = tx.accounts as { name?: string } | null;
      return {
        id: tx.id,
        accountId: tx.account_id,
        accountName: joinedAccount?.name || "Account",
        amount: amt,
        currency: tx.currency as Transaction['currency'],
        flowType: tx.flow_type as Transaction['flowType'],
        category: tx.category as Transaction['category'],
        categoryLabel: CATEGORY_LABELS[tx.category] || tx.category,
        payeeOrPayer: tx.payee_or_payer,
        note: tx.note || undefined,
        date: tx.date,
        time: tx.time ? tx.time.substring(0, 5) : "12:00",
        paymentMethod: tx.payment_method,
        status: tx.status,
        isRecurring: tx.is_recurring,
        createdAt: tx.created_at,
      };
    });

    const response: PaginatedTransactionsResponse = {
      transactions: mappedTransactions,
      totalCount,
      page,
      pageSize,
      totalPages,
      summary: {
        totalInflow,
        totalOutflow,
        netChange: totalInflow - totalOutflow,
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/finance/transactions
 * Creates transaction and adjusts account balance atomically.
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      accountId,
      amount,
      currency = "INR",
      flowType = "outflow",
      category = "other",
      payeeOrPayer,
      note,
      date = new Date().toISOString().split("T")[0],
      time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      paymentMethod = "card",
      status = "cleared",
      isRecurring = false,
      destinationAccountId,
    } = body;

    if (!accountId || amount === undefined || !payeeOrPayer) {
      return NextResponse.json(
        { error: "accountId, amount, and payeeOrPayer are required" },
        { status: 400 }
      );
    }

    const rawAmount = Number(amount);
    // Outflow must be negative, inflow positive
    const signedAmount = flowType === "inflow" ? Math.abs(rawAmount) : -Math.abs(rawAmount);

    const supabase = createAdminClient();

    // 1. Insert transaction
    const { data: newTx, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: authUser.userId,
        account_id: accountId,
        destination_account_id: destinationAccountId || null,
        amount: signedAmount,
        currency,
        flow_type: flowType,
        category,
        payee_or_payer: payeeOrPayer,
        note: note || null,
        date,
        time: time.length === 5 ? `${time}:00` : time,
        payment_method: paymentMethod,
        status,
        is_recurring: Boolean(isRecurring),
      })
      .select("*, accounts!transactions_account_id_fkey(name)")
      .single();

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 });
    }

    // 2. Adjust account balance
    const { data: srcAccount } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId)
      .single();

    if (srcAccount) {
      const newBalance = Number(srcAccount.balance) + signedAmount;
      await supabase
        .from("accounts")
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
          last_reconciled_at: new Date().toISOString(),
        })
        .eq("id", accountId);
    }

    // If transfer to destination account
    if (flowType === "transfer" && destinationAccountId) {
      const { data: dstAccount } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", destinationAccountId)
        .single();

      if (dstAccount) {
        const newDstBalance = Number(dstAccount.balance) + Math.abs(rawAmount);
        await supabase
          .from("accounts")
          .update({
            balance: newDstBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("id", destinationAccountId);
      }
    }

    const joinedNewAccount = newTx.accounts as { name?: string } | null;
    const mappedTx: Transaction = {
      id: newTx.id,
      accountId: newTx.account_id,
      accountName: joinedNewAccount?.name || "Account",
      amount: Number(newTx.amount),
      currency: newTx.currency as Transaction['currency'],
      flowType: newTx.flow_type as Transaction['flowType'],
      category: newTx.category as Transaction['category'],
      categoryLabel: CATEGORY_LABELS[newTx.category] || newTx.category,
      payeeOrPayer: newTx.payee_or_payer,
      note: newTx.note || undefined,
      date: newTx.date,
      time: newTx.time ? newTx.time.substring(0, 5) : "12:00",
      paymentMethod: newTx.payment_method as Transaction['paymentMethod'],
      status: newTx.status as Transaction['status'],
      isRecurring: newTx.is_recurring,
      createdAt: newTx.created_at,
    };

    return NextResponse.json(mappedTx, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
