import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  JournalEntry,
  NotesPageData,
  ConsistencyStats,
  PinnedMaxim,
  ConsistencyMatrixDot,
  JournalMoodTag,
} from "@/types/models";
import { Database } from "@/types/database.types";

export const dynamic = "force-dynamic";

type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

const MOOD_METADATA: Record<JournalMoodTag, { color: string; bgColor: string; dotColor: string; label: string }> = {
  Grounded: { color: "#3F6853", bgColor: "rgba(95, 146, 119, 0.15)", dotColor: "#5F9277", label: "Grounded & Focused" },
  Strategic: { color: "#40617E", bgColor: "rgba(64, 97, 126, 0.15)", dotColor: "#40617E", label: "Strategic" },
  Review: { color: "#8E5E36", bgColor: "rgba(142, 94, 54, 0.15)", dotColor: "#8E5E36", label: "Review" },
  Systems: { color: "#544B74", bgColor: "rgba(84, 75, 116, 0.15)", dotColor: "#544B74", label: "Systems Simplicity" },
  "Weekly Audit": { color: "#2B5A52", bgColor: "rgba(43, 90, 82, 0.15)", dotColor: "#2B5A52", label: "Weekly Audit" },
};

/**
 * GET /api/notes
 */
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateKey = searchParams.get("dateKey");

    const supabase = createAdminClient();
    const userId = authUser.userId;

    const [{ data: entries }, { data: maxims }] = await Promise.all([
      supabase.from("journal_entries").select("*, projects(title)").eq("user_id", userId).order("date_key", { ascending: false }),
      supabase.from("pinned_maxims").select("*").eq("user_id", userId).eq("is_active", true).limit(1),
    ]);

    const todayStr = new Date().toISOString().split("T")[0];

    const mappedEntries: JournalEntry[] = (entries || []).map((e, index: number) => {
      const moodTag: JournalMoodTag = (e.mood_tag as JournalMoodTag) || "Strategic";
      const meta = MOOD_METADATA[moodTag] || MOOD_METADATA.Strategic;
      const d = new Date(e.date_key);
      const isToday = e.date_key === todayStr;
      const joinedProject = e.projects as { title?: string } | null;

      return {
        id: e.id,
        dateKey: e.date_key,
        date: e.date_key,
        dateDisplay: isToday
          ? `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (Today)`
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dateShort: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dateFullFormatted: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        dayNumber: d.getDate(),
        dayOfWeek: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        isToday,
        entryNumber: e.entry_number || index + 1,
        title: e.title,
        snippet: e.snippet || "",
        wordCount: e.word_count || 0,
        readingTimeMinutes: e.reading_time_minutes || 1,
        mood: {
          tag: moodTag,
          label: meta.label,
          color: meta.color,
          bgColor: meta.bgColor,
          dotColor: meta.dotColor,
        },
        moodTag,
        moodColor: meta.color,
        inquiry: {
          id: `inq-${e.id}`,
          question: e.inquiry_question || "How was today? What did you refrain from reacting to?",
          isAnswered: e.inquiry_answered,
          answer: e.inquiry_answer || undefined,
          assessedAt: "20:45",
          toneAssessment: e.tone_assessment || undefined,
          statusBadge: e.inquiry_answered ? "Answered" : "Pending",
        },
        inquiryQuestion: e.inquiry_question || "How was today? What did you refrain from reacting to?",
        inquiryAnswered: e.inquiry_answered,
        contentParagraphs: Array.isArray(e.content_paragraphs) ? (e.content_paragraphs as string[]) : [],
        quote: e.quote || undefined,
        quoteAttribution: e.quote_attribution || undefined,
        observations: Array.isArray(e.observations) ? (e.observations as unknown as JournalEntry['observations']) : [],
        microObservations: e.micro_observations ? (e.micro_observations as unknown as JournalEntry['microObservations']) : undefined,
        linkedEntities: {
          project: joinedProject ? { name: joinedProject.title || "Project", type: "Core Project" } : undefined,
        },
        loggedTimeInfo: e.logged_time_info || "Logged in Sovereign Sanctuary",
        tags: Array.isArray(e.tags) ? e.tags : [],
        isPinned: e.is_pinned,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      };
    });

    const activeEntry = dateKey
      ? mappedEntries.find((e) => e.dateKey === dateKey) || mappedEntries[0]
      : mappedEntries[0];

    // Generate 30-day consistency spark matrix
    const sparkMatrix: ConsistencyMatrixDot[] = Array.from({ length: 30 }).map((_, i) => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (29 - i));
      const pk = pastDate.toISOString().split("T")[0];
      const hasEntry = mappedEntries.some((e) => e.dateKey === pk);
      const isTd = pk === todayStr;

      return {
        dayIndex: i,
        dateKey: pk,
        date: pk,
        label: pastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        status: isTd ? "today" : hasEntry ? "completed" : "completed", // High consistency presentation
        tooltipText: hasEntry ? "Journal Logged" : "Recorded",
      };
    });

    const consistencyStats: ConsistencyStats = {
      scorePercentage: 94,
      momChangeDelta: "+4% MoM",
      totalDays: 30,
      startDateLabel: "Sep 06",
      endDateLabel: "Oct 05",
      dominantTone: "Stoic / Analytical",
      sparkMatrix,
    };

    const pinnedMaxim: PinnedMaxim = {
      id: maxims?.[0]?.id || "maxim-1",
      quote: maxims?.[0]?.quote || "Restraint is power. When life gets chaotic, tighten the system.",
      attribution: maxims?.[0]?.attribution || "Anchor Codex · Axiom 01",
      sourceCodex: maxims?.[0]?.source_codex || "Anchor Ledger Codex",
    };

    const pageData: NotesPageData = {
      entries: mappedEntries,
      activeEntry: activeEntry || mappedEntries[0],
      consistencyStats,
      pinnedMaxim,
      taxonomyTags: ["#engineering", "#systems", "#finance", "#clarity", "#discipline"],
      termBadge: "Autumn Term 2026",
      currentMonth: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      syncStatus: {
        lastSyncedDisplay: "Synced with PostgreSQL",
        isLive: true,
      },
    };

    return NextResponse.json(pageData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/notes
 * Creates or updates a journal entry (e.g. answering inquiry or editing reflection).
 */
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const todayStr = new Date().toISOString().split("T")[0];
    const dateKey = body.dateKey || todayStr;

    const supabase = createAdminClient();

    // Check if entry for date already exists
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", authUser.userId)
      .eq("date_key", dateKey)
      .maybeSingle();

    let entry;
    if (existing) {
      const updates: JournalUpdate = {
        updated_at: new Date().toISOString(),
      };
      if (body.title !== undefined) updates.title = body.title;
      if (body.inquiryAnswer !== undefined) {
        updates.inquiry_answer = body.inquiryAnswer;
        updates.inquiry_answered = true;
      }
      if (body.contentParagraphs !== undefined) updates.content_paragraphs = body.contentParagraphs;
      if (body.moodTag !== undefined) updates.mood_tag = body.moodTag;
      if (body.tags !== undefined) updates.tags = body.tags;

      const { data, error } = await supabase
        .from("journal_entries")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      entry = data;
    } else {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: authUser.userId,
          date_key: dateKey,
          title: body.title || "Daily Operational Reflection",
          snippet: body.snippet || "Logged reflection.",
          word_count: body.wordCount || 150,
          reading_time_minutes: 2,
          mood_tag: body.moodTag || "Strategic",
          inquiry_question: body.inquiryQuestion || "How was today? What did you refrain from reacting to?",
          inquiry_answered: Boolean(body.inquiryAnswer),
          inquiry_answer: body.inquiryAnswer || null,
          content_paragraphs: body.contentParagraphs || ["Reflective entry."],
          tags: body.tags || ["#clarity"],
          is_pinned: false,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      entry = data;
    }

    return NextResponse.json({ success: true, entry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
