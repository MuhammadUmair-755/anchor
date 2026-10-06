-- ==============================================================================
-- Migration: 20261006000000_simple_notes.sql
-- Description: Turn journal_entries into plain notes.
--              - Allow many notes per day (drop UNIQUE(user_id, date_key)).
--              - Add a plain-text body column, backfilled from content_paragraphs.
--              - date_key defaults to today so inserts need only title + body.
-- ==============================================================================

ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_date_key;

ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '';

ALTER TABLE public.journal_entries ALTER COLUMN date_key SET DEFAULT CURRENT_DATE;

UPDATE public.journal_entries
SET body = (
  SELECT string_agg(p, E'\n\n' ORDER BY ord)
  FROM jsonb_array_elements_text(content_paragraphs) WITH ORDINALITY AS t(p, ord)
)
WHERE body = ''
  AND jsonb_typeof(content_paragraphs) = 'array'
  AND jsonb_array_length(content_paragraphs) > 0;
