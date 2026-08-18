CREATE OR REPLACE FUNCTION public.expire_wa_pending_actions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.wa_pending_actions
  SET status = 'expired'
  WHERE status IN ('pending', 'editing')
    AND expires_at < now();
$$;

REVOKE ALL ON FUNCTION public.expire_wa_pending_actions() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule('expire-wa-pending-actions')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-wa-pending-actions');

SELECT cron.schedule(
  'expire-wa-pending-actions',
  '7 * * * *',
  $$SELECT public.expire_wa_pending_actions();$$
);