
-- ============ app_settings ============
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);
CREATE POLICY "Admins can update app_settings"
  ON public.app_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.app_settings (key, value)
VALUES ('paytr_non3d_enabled', 'false'::jsonb),
       ('paytr_test_mode', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============ paytr_customer_tokens ============
CREATE TABLE IF NOT EXISTS public.paytr_customer_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  utoken text NOT NULL,
  ctoken text NOT NULL,
  last_4 text,
  card_brand text,
  card_bank text,
  require_cvv boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)
);
GRANT SELECT ON public.paytr_customer_tokens TO authenticated;
GRANT ALL ON public.paytr_customer_tokens TO service_role;
ALTER TABLE public.paytr_customer_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their business tokens"
  ON public.paytr_customer_tokens FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = paytr_customer_tokens.business_id
      AND b.user_id = auth.uid()
  ));

-- ============ subscription_billing ============
CREATE TABLE IF NOT EXISTS public.subscription_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_code text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TL',
  status text NOT NULL DEFAULT 'active', -- active | past_due | canceled | pending
  next_billing_date date,
  retry_count int NOT NULL DEFAULT 0,
  last_payment_status text,
  last_payment_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id)
);
GRANT SELECT ON public.subscription_billing TO authenticated;
GRANT ALL ON public.subscription_billing TO service_role;
ALTER TABLE public.subscription_billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their subscription"
  ON public.subscription_billing FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = subscription_billing.business_id
      AND b.user_id = auth.uid()
  ));

-- ============ paytr_payment_log ============
CREATE TABLE IF NOT EXISTS public.paytr_payment_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  merchant_oid text NOT NULL UNIQUE,
  payment_amount numeric(10,2),
  is_recurring boolean DEFAULT false,
  status text NOT NULL, -- initiated | success | failed | wait_callback
  error_message text,
  raw_notification jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.paytr_payment_log TO authenticated;
GRANT ALL ON public.paytr_payment_log TO service_role;
ALTER TABLE public.paytr_payment_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their payment log"
  ON public.paytr_payment_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = paytr_payment_log.business_id
      AND b.user_id = auth.uid()
  ));

-- ============ subscription_consent_log ============
CREATE TABLE IF NOT EXISTS public.subscription_consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  consent_ip text,
  plan_code text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'TL',
  consent_text_snapshot text NOT NULL
);
GRANT SELECT, INSERT ON public.subscription_consent_log TO authenticated;
GRANT ALL ON public.subscription_consent_log TO service_role;
ALTER TABLE public.subscription_consent_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their consent log"
  ON public.subscription_consent_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = subscription_consent_log.business_id
      AND b.user_id = auth.uid()
  ));
CREATE POLICY "Owners can insert their consent"
  ON public.subscription_consent_log FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = subscription_consent_log.business_id
        AND b.user_id = auth.uid()
    )
  );

-- ============ updated_at triggers ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_paytr_customer_tokens_updated ON public.paytr_customer_tokens;
CREATE TRIGGER trg_paytr_customer_tokens_updated
  BEFORE UPDATE ON public.paytr_customer_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subscription_billing_updated ON public.subscription_billing;
CREATE TRIGGER trg_subscription_billing_updated
  BEFORE UPDATE ON public.subscription_billing
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_app_settings_updated ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
