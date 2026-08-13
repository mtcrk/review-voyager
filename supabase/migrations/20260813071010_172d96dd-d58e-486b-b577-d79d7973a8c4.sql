-- 1. performance_metrics_cache: remove public write policies (service_role bypasses RLS)
DROP POLICY IF EXISTS "Service role can delete perf cache" ON public.performance_metrics_cache;
DROP POLICY IF EXISTS "Service role can insert perf cache" ON public.performance_metrics_cache;

-- 2. platform_rankings
DROP POLICY IF EXISTS "Service role can insert rankings" ON public.platform_rankings;
DROP POLICY IF EXISTS "Service role can update rankings" ON public.platform_rankings;

-- 3. platform_ratings
DROP POLICY IF EXISTS "Service role can insert platform ratings" ON public.platform_ratings;
DROP POLICY IF EXISTS "Service role can update platform ratings" ON public.platform_ratings;

-- 4. email_logs
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;

-- 5. integration_logs
DROP POLICY IF EXISTS "Service role can insert logs" ON public.integration_logs;

-- ensure service_role retains full access via grants
GRANT ALL ON public.performance_metrics_cache TO service_role;
GRANT ALL ON public.platform_rankings TO service_role;
GRANT ALL ON public.platform_ratings TO service_role;
GRANT ALL ON public.email_logs TO service_role;
GRANT ALL ON public.integration_logs TO service_role;
GRANT ALL ON public.story_kit_shares TO service_role;

-- 6. story_kit_shares: only allow inserts for an active template with matching business
DROP POLICY IF EXISTS "Anyone can create a share record" ON public.story_kit_shares;
CREATE POLICY "Share records only for active templates"
ON public.story_kit_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.story_kit_templates t
    WHERE t.id = story_kit_shares.template_id
      AND t.is_active = true
      AND t.business_id = story_kit_shares.business_id
  )
);

-- 7. Lock down internal email queue functions + set search_path
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.ci_set_updated_at() SET search_path = public;

REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;