-- ==============================================================================
-- ANCHOR Life Command Center - Consolidated Database Schema
-- File: supabase/schema.sql
-- Compatibility: PostgreSQL 15+ / Supabase / Clerk Authentication
-- Description: Complete idempotent schema definition for ANCHOR tables,
--              relationships, performance indexes, and RLS policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS

-- Function to extract user identity from either Clerk JWT claims or Supabase native auth
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', ''),
    (nullif(current_setting('request.jwt.claim.sub', true), ''))::text,
    auth.uid()::text
  );
$$ LANGUAGE SQL STABLE;

-- Trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. CORE IDENTITY & USER PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID (user_...)
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00, -- single source of truth for user funds
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. FINANCIAL LEDGER & TREASURY
-- ==============================================================================

-- Atomic balance adjustment (server/service_role only)
CREATE OR REPLACE FUNCTION public.adjust_balance(p_user_id TEXT, p_delta NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  UPDATE public.profiles SET balance = balance + p_delta WHERE id = p_user_id RETURNING balance;
$$;
REVOKE EXECUTE ON FUNCTION public.adjust_balance(TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_balance(TEXT, NUMERIC) TO service_role;

-- Financial transactions ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(14, 2) NOT NULL, -- Positive for inflow, negative for outflow
  currency TEXT NOT NULL DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
  flow_type TEXT NOT NULL CHECK (flow_type IN ('inflow', 'outflow', 'transfer')),
  category TEXT NOT NULL CHECK (category IN (
    'food_dining',
    'housing_utilities',
    'transport_transit',
    'shopping_gear',
    'health_wellness',
    'knowledge_subs',
    'consulting_inflow',
    'salary_payroll',
    'other'
  )),
  payee_or_payer TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME WITHOUT TIME ZONE DEFAULT CURRENT_TIME,
  payment_method TEXT NOT NULL DEFAULT 'card' CHECK (payment_method IN ('cash', 'upi', 'card', 'direct_deposit', 'wire')),
  status TEXT NOT NULL DEFAULT 'cleared' CHECK (status IN ('cleared', 'pending', 'reconciled')),
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Budget allocation envelopes per cycle
CREATE TABLE IF NOT EXISTS public.budget_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'food_dining',
    'housing_utilities',
    'transport_transit',
    'shopping_gear',
    'health_wellness',
    'knowledge_subs',
    'consulting_inflow',
    'salary_payroll',
    'other'
  )),
  label TEXT NOT NULL,
  allocated_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
  cycle TEXT NOT NULL, -- e.g. '2026-09' or 'September 2026'
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT budget_envelopes_user_cat_cycle_key UNIQUE (user_id, category, cycle)
);

-- Recurring obligations and subscriptions
CREATE TABLE IF NOT EXISTS public.recurring_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USD', 'EUR', 'GBP')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  renewal_notice TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'cleared', 'alert')),
  category TEXT NOT NULL,
  icon TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. TASKS & OPERATIONAL PROJECTS
-- ==============================================================================

-- Actionable tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL DEFAULT 'work' CHECK (category IN ('work', 'personal', 'finance', 'learning')),
  tab_category TEXT NOT NULL DEFAULT 'today' CHECK (tab_category IN ('today', 'upcoming', 'overdue', 'completed', 'backlog')),
  status_badge TEXT,
  due_date DATE,
  due_time TIME WITHOUT TIME ZONE,
  due_info TEXT,
  estimated_minutes INTEGER DEFAULT 30,
  is_focus_block BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. DAILY NOTES & JOURNAL
-- ==============================================================================

-- Daily journal reflections & audits
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_key DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_number INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  snippet TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  reading_time_minutes INTEGER NOT NULL DEFAULT 1,
  mood_tag TEXT NOT NULL DEFAULT 'Grounded' CHECK (mood_tag IN ('Grounded', 'Strategic', 'Review', 'Systems', 'Weekly Audit')),
  inquiry_question TEXT,
  inquiry_answered BOOLEAN NOT NULL DEFAULT FALSE,
  inquiry_answer TEXT,
  tone_assessment TEXT,
  content_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  quote TEXT,
  quote_attribution TEXT,
  observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  micro_observations JSONB NOT NULL DEFAULT '{"time": "", "items": []}'::jsonb,
  logged_time_info TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. CALENDAR & SOVEREIGN GOALS NEXUS
-- ==============================================================================

-- Unified calendar events & day reconciliations
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME WITHOUT TIME ZONE,
  type TEXT NOT NULL CHECK (type IN ('event', 'task', 'financial', 'journal')),
  amount NUMERIC(14, 2),
  note TEXT,
  is_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Accounts

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_flow ON public.transactions(user_id, flow_type);

-- Budget Envelopes
CREATE INDEX IF NOT EXISTS idx_budget_envelopes_user_cycle ON public.budget_envelopes(user_id, cycle);

-- Recurring Obligations
CREATE INDEX IF NOT EXISTS idx_recurring_obligations_user ON public.recurring_obligations(user_id, status);

-- Projects

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_tab ON public.tasks(user_id, tab_category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON public.tasks(user_id, is_completed, due_date);

-- Journal Entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date_key DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_pinned ON public.journal_entries(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON public.journal_entries(user_id, mood_tag);

-- Pinned Maxims

-- Calendar Events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(user_id, type);

-- Sovereign Goals

-- ==============================================================================
-- 9. TRIGGERS: AUTOMATIC updated_at MAINTENANCE
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_transactions_updated_at') THEN
    CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_budget_envelopes_updated_at') THEN
    CREATE TRIGGER trg_budget_envelopes_updated_at BEFORE UPDATE ON public.budget_envelopes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_recurring_obligations_updated_at') THEN
    CREATE TRIGGER trg_recurring_obligations_updated_at BEFORE UPDATE ON public.recurring_obligations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tasks_updated_at') THEN
    CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_journal_entries_updated_at') THEN
    CREATE TRIGGER trg_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_calendar_events_updated_at') THEN
    CREATE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users manage own profile
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = public.requesting_user_id());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = public.requesting_user_id());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = public.requesting_user_id());
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (id = public.requesting_user_id());

-- Accounts
CREATE POLICY "transactions_user_policy" ON public.transactions FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Budget Envelopes
CREATE POLICY "budget_envelopes_user_policy" ON public.budget_envelopes FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Recurring Obligations
CREATE POLICY "recurring_obligations_user_policy" ON public.recurring_obligations FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Projects
-- Tasks
CREATE POLICY "tasks_user_policy" ON public.tasks FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Journal Entries
CREATE POLICY "journal_entries_user_policy" ON public.journal_entries FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Pinned Maxims
-- Calendar Events
CREATE POLICY "calendar_events_user_policy" ON public.calendar_events FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Sovereign Goals
