
CREATE TABLE public.review_request_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  checkout_date DATE NOT NULL,
  language TEXT NOT NULL DEFAULT 'tr',
  consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  reminded_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, email, checkout_date)
);
CREATE INDEX idx_rrc_business ON public.review_request_contacts(business_id);
CREATE INDEX idx_rrc_status ON public.review_request_contacts(status);
CREATE INDEX idx_rrc_token ON public.review_request_contacts(unsubscribe_token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_request_contacts TO authenticated;
GRANT ALL ON public.review_request_contacts TO service_role;
ALTER TABLE public.review_request_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own review request contacts"
ON public.review_request_contacts FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid()));

CREATE TRIGGER update_rrc_updated_at BEFORE UPDATE ON public.review_request_contacts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


CREATE TABLE public.review_request_settings (
  business_id UUID PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  delay_hours INTEGER NOT NULL DEFAULT 24,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_days INTEGER NOT NULL DEFAULT 3,
  review_link TEXT,
  sender_name TEXT,
  template_intro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_request_settings TO authenticated;
GRANT ALL ON public.review_request_settings TO service_role;
ALTER TABLE public.review_request_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own review request settings"
ON public.review_request_settings FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid()));

CREATE TRIGGER update_rrs_updated_at BEFORE UPDATE ON public.review_request_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
