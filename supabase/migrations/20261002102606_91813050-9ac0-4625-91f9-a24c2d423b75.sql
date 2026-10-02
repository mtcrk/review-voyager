DO $$
DECLARE t text; s text;
BEGIN
  FOREACH t IN ARRAY ARRAY['businesses','ci_competitors'] LOOP
    FOREACH s IN ARRAY ARRAY['etstur','jollytur','tatilsepeti','serpapi','booking'] LOOP
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I text', t, s||'_match_status');
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I numeric', t, s||'_match_confidence');
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I text', t, s||'_match_reason');
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I text', t, s||'_match_source');
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I jsonb', t, s||'_match_candidate');
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %I timestamptz', t, s||'_match_checked_at');
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS match_name_snapshot text', t);
  END LOOP;
END $$;