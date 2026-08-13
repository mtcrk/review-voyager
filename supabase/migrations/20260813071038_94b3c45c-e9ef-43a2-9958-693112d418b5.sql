-- Trigger functions: never callable directly
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_business_credentials_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_social_connections_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_tiktok_tables_updated_at() FROM PUBLIC, anon, authenticated;

-- Internal role lookup: service side only
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;

-- Owner-scoped analytics + role check: authenticated only, no anonymous access
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.own_analysis_coverage(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.own_analysis_coverage(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.own_topic_monthly(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.own_topic_monthly(uuid, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_get_cron_jobs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_cron_jobs() TO authenticated, service_role;