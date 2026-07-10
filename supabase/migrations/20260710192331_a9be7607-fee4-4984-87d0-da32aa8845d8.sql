
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS score integer,
  ADD COLUMN IF NOT EXISTS ai_mentioned boolean,
  ADD COLUMN IF NOT EXISTS metadata jsonb;
