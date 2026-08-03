CREATE OR REPLACE FUNCTION public.own_topic_monthly(
  _business_id uuid,
  _months integer DEFAULT 12
)
RETURNS TABLE(
  bucket_month date,
  topic_id text,
  category text,
  is_decision_driver boolean,
  mention_count integer,
  avg_sentiment numeric,
  negative_share numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start date;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id AND b.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Forbidden: business not owned by current user';
  END IF;

  _months := greatest(1, least(coalesce(_months, 12), 36));
  v_start := (date_trunc('month', now()) - ((_months - 1) || ' months')::interval)::date;

  RETURN QUERY
  SELECT
    date_trunc('month', rt.review_posted_at)::date AS bucket_month,
    rt.topic_id,
    t.category,
    t.is_decision_driver,
    count(*)::int AS mention_count,
    round(avg(rt.sentiment)::numeric, 4) AS avg_sentiment,
    round((count(*) FILTER (WHERE rt.sentiment < -0.15))::numeric / count(*), 4) AS negative_share
  FROM public.ci_review_topics rt
  JOIN public.ci_topics t ON t.id = rt.topic_id
  WHERE rt.business_id = _business_id
    AND rt.review_source = 'own'
    AND rt.competitor_id IS NULL
    AND rt.review_posted_at >= v_start
  GROUP BY 1, 2, 3, 4;
END;
$$;

REVOKE ALL ON FUNCTION public.own_topic_monthly(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.own_topic_monthly(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.own_topic_monthly(uuid, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.own_analysis_coverage(_business_id uuid)
RETURNS TABLE(
  total_reviews integer,
  analyzed_reviews integer,
  pending_reviews integer,
  failed_reviews integer,
  skipped_reviews integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    count(*) FILTER (WHERE r.analysis_status = 'skipped')::int
  FROM public.reviews r
  WHERE r.business_id = _business_id;
END;
$$;

REVOKE ALL ON FUNCTION public.own_analysis_coverage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.own_analysis_coverage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.own_analysis_coverage(uuid) TO service_role;