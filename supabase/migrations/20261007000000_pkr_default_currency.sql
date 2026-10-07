-- PKR becomes the default currency. Existing INR rows were entered as "Rs." (PKR), so convert them.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['transactions', 'budget_envelopes', 'recurring_obligations'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', t, t || '_currency_check');
      EXECUTE format('UPDATE public.%I SET currency = ''PKR'' WHERE currency = ''INR''', t);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN currency SET DEFAULT ''PKR''', t);
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (currency IN (''PKR'', ''USD'', ''EUR'', ''GBP''))',
        t, t || '_currency_check'
      );
    END IF;
  END LOOP;
END $$;
