
CREATE OR REPLACE FUNCTION public.user_can_access_business(_user_id uuid, _business_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id AND (
      b.user_id = _user_id OR
      (b.group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.business_group_members m WHERE m.user_id = _user_id AND m.group_id = b.group_id))
    )
  );
$$;

ALTER TABLE public.competitor_price_snapshots
  ALTER COLUMN competitor_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS subject_type text NOT NULL DEFAULT 'competitor',
  ADD COLUMN IF NOT EXISTS price_per_night numeric,
  ADD COLUMN IF NOT EXISTS price_total numeric,
  ADD COLUMN IF NOT EXISTS price_derived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS board_type text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS room_name text,
  ADD COLUMN IF NOT EXISTS refundable boolean,
  ADD COLUMN IF NOT EXISTS taxes_included boolean,
  ADD COLUMN IF NOT EXISTS source_adapter text NOT NULL DEFAULT 'serpapi';
UPDATE public.competitor_price_snapshots SET price_per_night = price WHERE price_per_night IS NULL;
ALTER TABLE public.competitor_price_snapshots
  ADD CONSTRAINT cps_subject_chk CHECK ((subject_type='competitor' AND competitor_id IS NOT NULL) OR (subject_type='own' AND competitor_id IS NULL)),
  ADD CONSTRAINT cps_board_chk CHECK (board_type IN ('room_only','breakfast','half_board','full_board','all_inclusive','unknown')),
  ADD CONSTRAINT cps_adapter_chk CHECK (source_adapter IN ('serpapi','booking','manual'));
CREATE INDEX IF NOT EXISTS cps_biz_checkin_idx ON public.competitor_price_snapshots (business_id, checkin, subject_type, fetched_at DESC);

CREATE POLICY "Group members can view price snapshots" ON public.competitor_price_snapshots
  FOR SELECT TO authenticated USING (public.user_can_access_business(auth.uid(), business_id));

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS serpapi_property_token text,
  ADD COLUMN IF NOT EXISTS serpapi_matched_name text,
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS booking_matched_name text,
  ADD COLUMN IF NOT EXISTS price_tracking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_compare_board_type text,
  ADD COLUMN IF NOT EXISTS price_source_preference text,
  ADD COLUMN IF NOT EXISTS price_source_checked_at timestamptz;
UPDATE public.businesses SET price_compare_board_type =
  CASE WHEN coalesce(segment,'') ILIKE '%resort%' OR name ILIKE '%resort%' THEN 'all_inclusive' ELSE 'breakfast' END
  WHERE price_compare_board_type IS NULL;
ALTER TABLE public.businesses ALTER COLUMN price_compare_board_type SET DEFAULT 'breakfast';

ALTER TABLE public.ci_competitors
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS booking_matched_name text,
  ADD COLUMN IF NOT EXISTS serpapi_matched_name text,
  ADD COLUMN IF NOT EXISTS price_source_preference text,
  ADD COLUMN IF NOT EXISTS price_source_checked_at timestamptz;

CREATE TABLE public.own_rate_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  board_type text NOT NULL DEFAULT 'unknown' CHECK (board_type IN ('room_only','breakfast','half_board','full_board','all_inclusive','unknown')),
  room_name text,
  price_per_night numeric NOT NULL CHECK (price_per_night > 0),
  currency text NOT NULL DEFAULT 'TRY',
  refundable boolean,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX own_rate_entries_uq ON public.own_rate_entries (business_id, date, board_type, coalesce(room_name,''));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.own_rate_entries TO authenticated;
GRANT ALL ON public.own_rate_entries TO service_role;
ALTER TABLE public.own_rate_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage own rates" ON public.own_rate_entries FOR ALL TO authenticated
  USING (public.user_can_access_business(auth.uid(), business_id))
  WITH CHECK (public.user_can_access_business(auth.uid(), business_id));
CREATE TRIGGER set_own_rate_entries_updated_at BEFORE UPDATE ON public.own_rate_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.price_fetch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  adapter text NOT NULL,
  calls integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric NOT NULL DEFAULT 0,
  trigger text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_fetch_log TO authenticated;
GRANT ALL ON public.price_fetch_log TO service_role;
ALTER TABLE public.price_fetch_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view fetch log" ON public.price_fetch_log FOR SELECT TO authenticated
  USING (business_id IS NOT NULL AND public.user_can_access_business(auth.uid(), business_id));
