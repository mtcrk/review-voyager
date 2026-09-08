ALTER TABLE public.ci_competitors ADD COLUMN IF NOT EXISTS serpapi_property_token text;

CREATE TABLE public.competitor_price_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid NOT NULL REFERENCES public.ci_competitors(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  checkin date NOT NULL,
  nights int NOT NULL DEFAULT 1,
  adults int NOT NULL DEFAULT 2,
  source text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'TRY',
  is_official boolean DEFAULT false,
  is_ad boolean DEFAULT false,
  num_guests int,
  free_cancellation boolean,
  raw jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.competitor_price_snapshots TO authenticated;
GRANT ALL ON public.competitor_price_snapshots TO service_role;

ALTER TABLE public.competitor_price_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cps_select" ON public.competitor_price_snapshots
FOR SELECT TO authenticated
USING (business_id IN (SELECT businesses.id FROM public.businesses WHERE businesses.user_id = auth.uid()));

CREATE POLICY "cps_service_write" ON public.competitor_price_snapshots
FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_cps_competitor_checkin_fetched
  ON public.competitor_price_snapshots (competitor_id, checkin, fetched_at DESC);