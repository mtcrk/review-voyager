CREATE OR REPLACE FUNCTION public.mark_instant_chunk_done(_query_id uuid, _chunk text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH u AS (
    UPDATE public.price_instant_queries
    SET done_chunks = array_append(done_chunks, _chunk)
    WHERE id = _query_id AND status = 'running' AND NOT (_chunk = ANY(done_chunks))
    RETURNING 1
  ) SELECT EXISTS (SELECT 1 FROM u);
$$;
REVOKE ALL ON FUNCTION public.mark_instant_chunk_done(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_instant_chunk_done(uuid, text) TO service_role;