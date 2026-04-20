-- Admin-only function to read cron.job table (security definer bypasses cron schema RLS)
CREATE OR REPLACE FUNCTION public.admin_get_cron_jobs()
RETURNS TABLE (
  jobid bigint,
  jobname text,
  schedule text,
  command text,
  active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  -- Restrict to admin role
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  RETURN QUERY
  SELECT j.jobid, j.jobname, j.schedule, j.command, j.active
  FROM cron.job j
  ORDER BY j.jobid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_cron_jobs() TO authenticated;