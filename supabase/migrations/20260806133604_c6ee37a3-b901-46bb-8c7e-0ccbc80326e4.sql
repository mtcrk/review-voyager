ALTER TABLE public.subscription_billing
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

UPDATE public.subscription_billing
SET started_at = created_at,
    current_period_start = coalesce(last_payment_at, created_at),
    canceled_at = CASE WHEN status = 'canceled' THEN updated_at ELSE NULL END;