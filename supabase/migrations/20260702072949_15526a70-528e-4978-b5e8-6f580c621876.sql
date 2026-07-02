
ALTER TABLE public.paytr_payment_log
  ADD COLUMN IF NOT EXISTS user_ip text,
  ADD COLUMN IF NOT EXISTS plan_code text;

ALTER TABLE public.paytr_customer_tokens
  ADD COLUMN IF NOT EXISTS last_payment_ip text;
