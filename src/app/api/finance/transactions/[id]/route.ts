import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "../../../tasks/shared";

export const dynamic = "force-dynamic";

/** DELETE /api/finance/transactions/[id] — removes a transaction and reverses it on the balance. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const supabase = createAdminClient();
    const { data: deleted, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select("*")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const { error: balanceError } = await supabase.rpc("adjust_balance", {
      p_user_id: authUser.userId,
      p_delta: -Number(deleted.amount),
    });
    if (balanceError) {
      await supabase.from("transactions").insert(deleted); // restore so balance and ledger stay in sync
      return NextResponse.json({ error: balanceError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
