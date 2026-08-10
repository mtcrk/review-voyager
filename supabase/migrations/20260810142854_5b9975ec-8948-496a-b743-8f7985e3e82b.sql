-- ============ wa_recipients ============
CREATE TABLE public.wa_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  -- Bu projede şubeler ayrı bir tablo değil: public.businesses içinde parent_business_id ile
  -- tutuluyor. location_id bu yüzden businesses(id)'ye bağlandı ve nullable bırakıldı
  -- (null = işletme genel alıcısı, dolu = belirli şube alıcısı).
  location_id uuid NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  display_name text,
  role text NOT NULL DEFAULT 'manager',
  opt_in_at timestamptz,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text NOT NULL DEFAULT 'Europe/Istanbul',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.wa_recipients.phone_e164 IS 'KİŞİSEL VERİ (KVKK): E.164 formatında telefon. Loglarda/hata mesajlarında maskelenerek yazılmalı (örn. +905********12).';
COMMENT ON COLUMN public.wa_recipients.location_id IS 'Şube kaydı: public.businesses içindeki alt işletme (parent_business_id ile bağlı) satırı. Null ise işletme genelidir.';
COMMENT ON COLUMN public.wa_recipients.opt_in_at IS 'Null ise mesaj GÖNDERİLMEZ (açık rıza yok).';

CREATE UNIQUE INDEX wa_recipients_business_phone_key ON public.wa_recipients (business_id, phone_e164);
CREATE INDEX wa_recipients_business_active_idx ON public.wa_recipients (business_id, is_active);
CREATE INDEX wa_recipients_location_idx ON public.wa_recipients (location_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wa_recipients TO authenticated;
GRANT ALL ON public.wa_recipients TO service_role;
ALTER TABLE public.wa_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_recipients_select ON public.wa_recipients FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_recipients_insert ON public.wa_recipients FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_recipients_update ON public.wa_recipients FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_recipients_delete ON public.wa_recipients FOR DELETE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_recipients_admin_select ON public.wa_recipients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY wa_recipients_service_write ON public.wa_recipients FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER set_wa_recipients_updated_at BEFORE UPDATE ON public.wa_recipients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ wa_messages ============
CREATE TABLE public.wa_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.wa_recipients(id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('outbound','inbound')),
  provider text NOT NULL DEFAULT 'twilio',
  provider_message_id text,
  template_name text,
  category text CHECK (category IN ('utility','marketing','authentication','service')),
  body text,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','sent','delivered','read','failed','received')),
  error_code text,
  error_message text,
  cost_amount numeric(12,6) NOT NULL DEFAULT 0,
  cost_currency text NOT NULL DEFAULT 'USD',
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.wa_messages.body IS 'Mesaj metni; telefon numarası gibi KİŞİSEL VERİ içerebilir, loglarda maskelenmeli.';
COMMENT ON COLUMN public.wa_messages.cost_amount IS 'Meta/BSP mesaj başı ücreti (conversation/PMP fiyatlaması).';

CREATE INDEX wa_messages_business_created_idx ON public.wa_messages (business_id, created_at DESC);
CREATE INDEX wa_messages_provider_message_id_idx ON public.wa_messages (provider_message_id);
CREATE INDEX wa_messages_recipient_idx ON public.wa_messages (recipient_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wa_messages TO authenticated;
GRANT ALL ON public.wa_messages TO service_role;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_messages_select ON public.wa_messages FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_messages_insert ON public.wa_messages FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_messages_update ON public.wa_messages FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_messages_admin_select ON public.wa_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY wa_messages_service_write ON public.wa_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============ wa_pending_actions ============
CREATE TABLE public.wa_pending_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.wa_recipients(id) ON DELETE CASCADE,
  short_code text NOT NULL,
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  draft_reply text NOT NULL,
  message_id uuid REFERENCES public.wa_messages(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  consumed_at timestamptz,
  resulting_reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.wa_pending_actions.short_code IS 'Mesajda gösterilen kısa kod (1,2,3...). Yalnızca aktif (consumed_at IS NULL) kayıtlarda alıcı başına tekildir.';

CREATE UNIQUE INDEX wa_pending_actions_active_code_key
  ON public.wa_pending_actions (recipient_id, short_code) WHERE consumed_at IS NULL;
CREATE INDEX wa_pending_actions_recipient_open_idx
  ON public.wa_pending_actions (recipient_id) WHERE consumed_at IS NULL;
CREATE INDEX wa_pending_actions_review_idx ON public.wa_pending_actions (review_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wa_pending_actions TO authenticated;
GRANT ALL ON public.wa_pending_actions TO service_role;
ALTER TABLE public.wa_pending_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_pending_actions_select ON public.wa_pending_actions FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_pending_actions_insert ON public.wa_pending_actions FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_pending_actions_update ON public.wa_pending_actions FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_pending_actions_delete ON public.wa_pending_actions FOR DELETE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_pending_actions_admin_select ON public.wa_pending_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY wa_pending_actions_service_write ON public.wa_pending_actions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============ wa_conversations ============
CREATE TABLE public.wa_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL UNIQUE REFERENCES public.wa_recipients(id) ON DELETE CASCADE,
  window_opened_at timestamptz,
  window_expires_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.wa_conversations IS '24 saatlik WhatsApp servis penceresi takibi. 1 Ekim 2026 sonrası pencere içi mesajlar da ücretlendirilecek.';

CREATE INDEX wa_conversations_business_idx ON public.wa_conversations (business_id);
CREATE INDEX wa_conversations_expires_idx ON public.wa_conversations (window_expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wa_conversations TO authenticated;
GRANT ALL ON public.wa_conversations TO service_role;
ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_conversations_select ON public.wa_conversations FOR SELECT TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_conversations_insert ON public.wa_conversations FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_conversations_update ON public.wa_conversations FOR UPDATE TO authenticated
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY wa_conversations_admin_select ON public.wa_conversations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY wa_conversations_service_write ON public.wa_conversations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER set_wa_conversations_updated_at BEFORE UPDATE ON public.wa_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();