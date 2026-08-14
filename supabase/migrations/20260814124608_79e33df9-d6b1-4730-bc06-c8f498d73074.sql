ALTER TABLE public.wa_recipients
  ADD COLUMN IF NOT EXISTS min_rating_threshold int NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS daily_cap int NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS opt_out_at timestamptz;

ALTER TABLE public.wa_pending_actions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.wa_pending_actions
  DROP CONSTRAINT IF EXISTS wa_pending_actions_status_check;
ALTER TABLE public.wa_pending_actions
  ADD CONSTRAINT wa_pending_actions_status_check
  CHECK (status IN ('pending','approved','editing','skipped','expired'));

CREATE UNIQUE INDEX IF NOT EXISTS wa_pending_actions_unique_pending
  ON public.wa_pending_actions (review_id, recipient_id)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS wa_recipients_business_phone_key
  ON public.wa_recipients (business_id, phone_e164);

CREATE INDEX IF NOT EXISTS wa_messages_business_created_idx
  ON public.wa_messages (business_id, created_at DESC);