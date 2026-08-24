CREATE INDEX IF NOT EXISTS idx_reviews_business_posted_at ON public.reviews USING btree (business_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ci_rt_review_id_topic ON public.ci_review_topics USING btree (review_id, topic_id);

CREATE OR REPLACE FUNCTION public.group_topic_matrix(_group_id uuid, _from timestamptz, _to timestamptz)
RETURNS TABLE(
  business_id uuid,
  business_name text,
  topic_id text,
  category text,
  is_decision_driver boolean,
  total_mentions integer,
  positive_mentions integer,
  negative_mentions integer,
  positive_rate numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_group_admin(auth.uid(), _group_id) THEN
    RAISE EXCEPTION 'Forbidden: group admin role required';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.name,
    rt.topic_id,
    t.category,
    t.is_decision_driver,
    count(*)::int,
    count(*) FILTER (WHERE rt.sentiment > 0.15)::int,
    count(*) FILTER (WHERE rt.sentiment < -0.15)::int,
    round(100.0 * count(*) FILTER (WHERE rt.sentiment > 0.15) / count(*), 1)
  FROM public.businesses b
  JOIN public.reviews r
    ON r.business_id = b.id
   AND r.posted_at >= _from
   AND r.posted_at <= _to
  JOIN public.ci_review_topics rt
    ON rt.review_id = r.id
   AND rt.review_source = 'own'
   AND rt.competitor_id IS NULL
  JOIN public.ci_topics t ON t.id = rt.topic_id
  WHERE b.group_id = _group_id
  GROUP BY b.id, b.name, rt.topic_id, t.category, t.is_decision_driver;
END;
$$;

REVOKE ALL ON FUNCTION public.group_topic_matrix(uuid, timestamptz, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.group_topic_matrix(uuid, timestamptz, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.group_topic_matrix(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_topic_matrix(uuid, timestamptz, timestamptz) TO service_role;

CREATE OR REPLACE FUNCTION public.group_topic_quotes(
  _group_id uuid,
  _business_id uuid,
  _topic_id text,
  _from timestamptz,
  _to timestamptz,
  _limit integer DEFAULT 20,
  _offset integer DEFAULT 0
)
RETURNS TABLE(
  review_id uuid,
  excerpt text,
  sentiment numeric,
  posted_at timestamptz,
  platform text,
  rating numeric,
  review_text text,
  highlights jsonb,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_group_admin(auth.uid(), _group_id) THEN
    RAISE EXCEPTION 'Forbidden: group admin role required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id AND b.group_id = _group_id
  ) THEN
    RAISE EXCEPTION 'Forbidden: business not in group';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    rt.excerpt,
    rt.sentiment,
    r.posted_at,
    r.platform,
    r.rating::numeric,
    r.text,
    ra.highlights,
    count(*) OVER ()
  FROM public.reviews r
  JOIN public.ci_review_topics rt
    ON rt.review_id = r.id
   AND rt.review_source = 'own'
   AND rt.competitor_id IS NULL
   AND rt.topic_id = _topic_id
  LEFT JOIN public.review_analysis ra ON ra.review_id = r.id
  WHERE r.business_id = _business_id
    AND r.posted_at >= _from
    AND r.posted_at <= _to
  ORDER BY r.posted_at DESC
  LIMIT greatest(1, least(coalesce(_limit, 20), 50))
  OFFSET greatest(0, coalesce(_offset, 0));
END;
$$;

REVOKE ALL ON FUNCTION public.group_topic_quotes(uuid, uuid, text, timestamptz, timestamptz, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.group_topic_quotes(uuid, uuid, text, timestamptz, timestamptz, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.group_topic_quotes(uuid, uuid, text, timestamptz, timestamptz, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_topic_quotes(uuid, uuid, text, timestamptz, timestamptz, integer, integer) TO service_role;