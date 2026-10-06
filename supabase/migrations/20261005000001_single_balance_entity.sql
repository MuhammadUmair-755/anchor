-- ==============================================================================
-- Migration: 20261005000001_single_balance_entity.sql
-- Description: Replace the multi-account system with a single balance per user.
--              - profiles.balance becomes the one source of truth for funds.
--              - Existing account balances are folded into it (credit balances
--                are stored negative, so a plain SUM gives net funds).
--              - accounts table and transaction account FKs are dropped.
--              - adjust_balance() applies deltas atomically (no read-then-write).
-- ==============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00;

DO $$
BEGIN
  IF to_regclass('public.accounts') IS NOT NULL THEN
    UPDATE public.profiles p
    SET balance = COALESCE((SELECT SUM(a.balance) FROM public.accounts a WHERE a.user_id = p.id), 0);
  END IF;
END $$;

ALTER TABLE public.transactions
  DROP COLUMN IF EXISTS account_id,
  DROP COLUMN IF EXISTS destination_account_id;

DROP TABLE IF EXISTS public.accounts;

CREATE OR REPLACE FUNCTION public.adjust_balance(p_user_id TEXT, p_delta NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
AS $$
  UPDATE public.profiles
  SET balance = balance + p_delta
  WHERE id = p_user_id
  RETURNING balance;
$$;

-- Server (service_role) only: never callable from the browser via PostgREST.
REVOKE EXECUTE ON FUNCTION public.adjust_balance(TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_balance(TEXT, NUMERIC) TO service_role;
