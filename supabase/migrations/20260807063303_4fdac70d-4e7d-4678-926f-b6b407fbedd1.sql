ALTER TABLE public.paytr_payment_log ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.subscription_billing ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

UPDATE public.paytr_payment_log SET is_test = true WHERE created_at < '2026-08-06';
UPDATE public.subscription_billing SET is_test = true WHERE created_at < '2026-08-06';