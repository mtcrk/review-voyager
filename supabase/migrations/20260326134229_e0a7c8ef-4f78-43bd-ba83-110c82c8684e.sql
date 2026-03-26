
CREATE TABLE IF NOT EXISTS public.performance_metrics_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  metric_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  search_keywords JSONB DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_perf_cache_location ON public.performance_metrics_cache(location_id, fetched_at DESC);

ALTER TABLE public.performance_metrics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business perf cache"
  ON public.performance_metrics_cache FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert perf cache"
  ON public.performance_metrics_cache FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete perf cache"
  ON public.performance_metrics_cache FOR DELETE
  USING (true);
