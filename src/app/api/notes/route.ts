import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { toNote, bodyStats, parseNoteInput } from "@/services/notesService";

export const dynamic = "force-dynamic";

/**
 * GET /api/notes → { notes: Note[] }, newest edit first.
 */
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await createAdminClient()
      .from("journal_entries")
      .select("*")
      .eq("user_id", authUser.userId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: (data || []).map(toNote) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/notes { title, body } → 201 Note
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = parseNoteInput(await req.json().catch(() => null), false);
    if ("error" in input) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }

    const body = input.body ?? "";
    const { data, error } = await createAdminClient()
      .from("journal_entries")
      .insert({
        user_id: authUser.userId,
        date_key: new Date().toISOString().split("T")[0],
        title: input.title!,
        body,
        ...bodyStats(body),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(toNote(data), { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
