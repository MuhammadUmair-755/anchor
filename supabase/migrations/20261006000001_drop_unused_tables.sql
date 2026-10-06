-- ==============================================================================
-- Migration: 20261006000001_drop_unused_tables.sql
-- Description: Remove tables whose features were deleted from the app.
--              - sovereign_goals  (Calendar "Sovereign Goals Hub" removed)
--              - pinned_maxims    (Overview "Mindset & Goal" card removed)
--              - projects         (fake project picker removed from Tasks/Notes)
--              The two columns that referenced projects are dropped first.
-- ==============================================================================

ALTER TABLE public.tasks DROP COLUMN IF EXISTS project_id;
ALTER TABLE public.journal_entries DROP COLUMN IF EXISTS linked_project_id;

DROP TABLE IF EXISTS public.sovereign_goals;
DROP TABLE IF EXISTS public.pinned_maxims;
DROP TABLE IF EXISTS public.projects;
