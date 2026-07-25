
ALTER TABLE public.whatsapp_channels
  ADD COLUMN IF NOT EXISTS credentials_secret_name text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS billable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

ALTER TABLE public.guest_stays
  ADD COLUMN IF NOT EXISTS adults int,
  ADD COLUMN IF NOT EXISTS children int;

ALTER TABLE public.extra_requests
  ADD COLUMN IF NOT EXISTS price_snapshot numeric(12,2),
  ADD COLUMN IF NOT EXISTS currency_snapshot text;
