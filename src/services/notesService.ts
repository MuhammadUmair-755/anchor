import { Note } from '@/types/models';
import { apiRequest } from '@/lib/api/client';
import { Database } from '@/types/database.types';

type NoteRow = Database['public']['Tables']['journal_entries']['Row'];

/** Maps a journal_entries row to a Note. Falls back to content_paragraphs for rows without a body. */
export function toNote(row: NoteRow): Note {
  const paragraphs = Array.isArray(row.content_paragraphs) ? (row.content_paragraphs as string[]) : [];
  return {
    id: row.id,
    title: row.title,
    body: row.body || paragraphs.join('\n\n'),
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Derived columns stored alongside the body. */
export function bodyStats(body: string) {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  return {
    word_count: words,
    reading_time_minutes: Math.max(1, Math.ceil(words / 200)),
    snippet: body.replace(/\s+/g, ' ').trim().slice(0, 140),
  };
}

/** Validates a create (all fields) or patch (partial) payload. Returns an error message or the clean fields. */
export function parseNoteInput(
  input: unknown,
  partial: boolean
): { error: string } | { title?: string; body?: string } {
  const { title, body } = (input ?? {}) as { title?: unknown; body?: unknown };
  const out: { title?: string; body?: string } = {};
  if (title !== undefined || !partial) {
    if (typeof title !== 'string' || !title.trim()) return { error: 'Title is required' };
    if (title.trim().length > 200) return { error: 'Title must be 200 characters or fewer' };
    out.title = title.trim();
  }
  if (body !== undefined || !partial) {
    if (typeof body !== 'string') return { error: 'Body must be a string' };
    out.body = body;
  }
  if (partial && out.title === undefined && out.body === undefined) return { error: 'Nothing to update' };
  return out;
}

export const notesService = {
  async list(): Promise<Note[]> {
    const { notes } = await apiRequest<{ notes: Note[] }>('/api/notes');
    return notes;
  },

  create(input: { title: string; body: string }): Promise<Note> {
    return apiRequest<Note>('/api/notes', { method: 'POST', body: JSON.stringify(input) });
  },

  update(id: string, input: { title?: string; body?: string }): Promise<Note> {
    return apiRequest<Note>(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/api/notes/${id}`, { method: 'DELETE' });
  },
};
