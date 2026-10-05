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
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. FINANCIAL LEDGER & TREASURY
-- ==============================================================================

-- Financial depository / credit accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'cash', 'savings', 'credit')),
  institution TEXT,
  account_number_masked TEXT,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reconciled', 'archived')),
  trend_label TEXT,
  credit_limit NUMERIC(14, 2),
  payment_due_date DATE,
  last_reconciled_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Financial transactions ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  destination_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount NUMERIC(14, 2) NOT NULL, -- Positive for inflow, negative for outflow
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
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
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
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
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
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

-- Operational projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tag TEXT,
  description TEXT,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  next_milestone TEXT,
  target_date DATE,
  accent_color TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Actionable tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
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
  date_key DATE NOT NULL,
  entry_number INTEGER,
  title TEXT NOT NULL,
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
  linked_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  logged_time_info TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT journal_entries_user_date_key UNIQUE (user_id, date_key)
);

-- Pinned codex axioms and maxims
CREATE TABLE IF NOT EXISTS public.pinned_maxims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote TEXT NOT NULL,
  attribution TEXT NOT NULL,
  source_codex TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
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

-- Sovereign horizon goals
CREATE TABLE IF NOT EXISTS public.sovereign_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  target_horizon TEXT,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  achieved_metric TEXT,
  gap_metric TEXT,
  meter_color TEXT,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(user_id, status);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON public.transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_flow ON public.transactions(user_id, flow_type);

-- Budget Envelopes
CREATE INDEX IF NOT EXISTS idx_budget_envelopes_user_cycle ON public.budget_envelopes(user_id, cycle);

-- Recurring Obligations
CREATE INDEX IF NOT EXISTS idx_recurring_obligations_user ON public.recurring_obligations(user_id, status);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_tab ON public.tasks(user_id, tab_category);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON public.tasks(user_id, is_completed, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);

-- Journal Entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date_key DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_pinned ON public.journal_entries(user_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON public.journal_entries(user_id, mood_tag);

-- Pinned Maxims
CREATE INDEX IF NOT EXISTS idx_pinned_maxims_user ON public.pinned_maxims(user_id, is_active);

-- Calendar Events
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(user_id, type);

-- Sovereign Goals
CREATE INDEX IF NOT EXISTS idx_sovereign_goals_user ON public.sovereign_goals(user_id);

-- ==============================================================================
-- 9. TRIGGERS: AUTOMATIC updated_at MAINTENANCE
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_accounts_updated_at') THEN
    CREATE TRIGGER trg_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at') THEN
    CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tasks_updated_at') THEN
    CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_journal_entries_updated_at') THEN
    CREATE TRIGGER trg_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pinned_maxims_updated_at') THEN
    CREATE TRIGGER trg_pinned_maxims_updated_at BEFORE UPDATE ON public.pinned_maxims FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_calendar_events_updated_at') THEN
    CREATE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sovereign_goals_updated_at') THEN
    CREATE TRIGGER trg_sovereign_goals_updated_at BEFORE UPDATE ON public.sovereign_goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_maxims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sovereign_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users manage own profile
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = public.requesting_user_id());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = public.requesting_user_id());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = public.requesting_user_id());
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (id = public.requesting_user_id());

-- Accounts
CREATE POLICY "accounts_user_policy" ON public.accounts FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Transactions
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
CREATE POLICY "projects_user_policy" ON public.projects FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Tasks
CREATE POLICY "tasks_user_policy" ON public.tasks FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Journal Entries
CREATE POLICY "journal_entries_user_policy" ON public.journal_entries FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Pinned Maxims
CREATE POLICY "pinned_maxims_user_policy" ON public.pinned_maxims FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Calendar Events
CREATE POLICY "calendar_events_user_policy" ON public.calendar_events FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- Sovereign Goals
CREATE POLICY "sovereign_goals_user_policy" ON public.sovereign_goals FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());
