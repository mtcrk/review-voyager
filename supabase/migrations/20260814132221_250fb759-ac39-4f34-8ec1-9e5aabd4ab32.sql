ALTER TABLE public.wa_recipients
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending_verification',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_sent_at timestamptz;

UPDATE public.wa_recipients SET status = 'verified', verified_at = COALESCE(verified_at, opt_in_at, created_at) WHERE status = 'pending_verification';

ALTER TABLE public.wa_recipients DROP CONSTRAINT IF EXISTS wa_recipients_status_check;
ALTER TABLE public.wa_recipients ADD CONSTRAINT wa_recipients_status_check
  CHECK (status IN ('pending_verification','verified','declined','opted_out'));