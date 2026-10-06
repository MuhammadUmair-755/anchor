import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { Database } from "@/types/database.types";
import { toNote, bodyStats, parseNoteInput } from "@/services/notesService";

export const dynamic = "force-dynamic";

type NoteUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

/**
 * PATCH /api/notes/[id] { title?, body? } → Note
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const input = parseNoteInput(await req.json().catch(() => null), true);
    if ("error" in input) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }

    const updates: NoteUpdate = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.body !== undefined) Object.assign(updates, { body: input.body }, bodyStats(input.body));

    const { data, error } = await createAdminClient()
      .from("journal_entries")
      .update(updates)
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select()
      .maybeSingle();

    if (error) {
      // 22P02 = malformed uuid, i.e. no such note
      if (error.code === "22P02") return NextResponse.json({ error: "Note not found" }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(toNote(data));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/notes/[id]
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { data, error } = await createAdminClient()
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.userId)
      .select("id");

    if (error) {
      // 22P02 = malformed uuid, i.e. no such note
      if (error.code === "22P02") return NextResponse.json({ error: "Note not found" }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data?.length) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
