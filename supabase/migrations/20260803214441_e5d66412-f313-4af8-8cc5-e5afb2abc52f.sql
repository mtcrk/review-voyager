ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_analysis_status_check;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_analysis_status_check CHECK (analysis_status = ANY (ARRAY['pending'::text, 'done'::text, 'failed'::text, 'skipped'::text, 'deferred'::text]));

DROP FUNCTION IF EXISTS public.own_analysis_coverage(uuid);

CREATE OR REPLACE FUNCTION public.own_analysis_coverage(_business_id uuid)
RETURNS TABLE(
  total_reviews integer,
  analyzed_reviews integer,
  pending_reviews integer,
  failed_reviews integer,
  skipped_reviews integer,
  deferred_reviews integer,
  window_total_reviews integer,
  window_analyzed_reviews integer,
  window_pending_reviews integer,
  window_failed_reviews integer,
  window_months integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cutoff timestamptz := now() - interval '6 months';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id AND b.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden: business not owned by current user';
  END IF;

  RETURN QUERY
  SELECT
    count(*)::int,
    count(*) FILTER (WHERE r.analysis_status = 'done')::int,
    count(*) FILTER (WHERE r.analysis_status = 'pending')::int,
    count(*) FILTER (WHERE r.analysis_status = 'failed')::int,
    count(*) FILTER (WHERE r.analysis_status = 'skipped')::int,
    count(*) FILTER (WHERE r.analysis_status = 'deferred')::int,
    count(*) FILTER (WHERE r.posted_at > v_cutoff)::int,
    count(*) FILTER (WHERE r.posted_at > v_cutoff AND r.analysis_status = 'done')::int,
    count(*) FILTER (WHERE r.posted_at > v_cutoff AND r.analysis_status = 'pending')::int,
    count(*) FILTER (WHERE r.posted_at > v_cutoff AND r.analysis_status = 'failed')::int,
    6
  FROM public.reviews r
  WHERE r.business_id = _business_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.own_analysis_coverage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.own_analysis_coverage(uuid) TO service_role;