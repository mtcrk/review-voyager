
CREATE TABLE public.whatsapp_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('twilio','360dialog')),
  phone_number TEXT NOT NULL,
  display_name TEXT,
  provider_account_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','connecting','active','suspended')),
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX whatsapp_channels_one_active_per_business
  ON public.whatsapp_channels(business_id)
  WHERE status = 'active';
CREATE INDEX idx_whatsapp_channels_business ON public.whatsapp_channels(business_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_channels TO authenticated;
GRANT ALL ON public.whatsapp_channels TO service_role;
ALTER TABLE public.whatsapp_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view whatsapp_channels of their businesses" ON public.whatsapp_channels FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_channels.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert whatsapp_channels for their businesses" ON public.whatsapp_channels FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_channels.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update whatsapp_channels of their businesses" ON public.whatsapp_channels FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_channels.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete whatsapp_channels of their businesses" ON public.whatsapp_channels FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_channels.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.whatsapp_channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('utility','marketing','authentication')),
  body_text TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  provider_template_ref TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_whatsapp_templates_business ON public.whatsapp_templates(business_id);
CREATE INDEX idx_whatsapp_templates_channel ON public.whatsapp_templates(channel_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_templates TO authenticated;
GRANT ALL ON public.whatsapp_templates TO service_role;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view whatsapp_templates of their businesses" ON public.whatsapp_templates FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_templates.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert whatsapp_templates for their businesses" ON public.whatsapp_templates FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_templates.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update whatsapp_templates of their businesses" ON public.whatsapp_templates FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_templates.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete whatsapp_templates of their businesses" ON public.whatsapp_templates FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_templates.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  full_name TEXT,
  locale TEXT,
  country_code TEXT,
  consent_status TEXT NOT NULL DEFAULT 'none' CHECK (consent_status IN ('none','granted','rejected')),
  consent_source TEXT,
  consent_at TIMESTAMPTZ,
  iys_synced_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, phone_number)
);
CREATE INDEX idx_guests_business ON public.guests(business_id);
CREATE INDEX idx_guests_phone ON public.guests(phone_number);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view guests of their businesses" ON public.guests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guests.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert guests for their businesses" ON public.guests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guests.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update guests of their businesses" ON public.guests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guests.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete guests of their businesses" ON public.guests FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guests.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.guest_stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_type TEXT,
  reservation_ref TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv','pms')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','in_house','checked_out','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_guest_stays_business ON public.guest_stays(business_id);
CREATE INDEX idx_guest_stays_guest ON public.guest_stays(guest_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_stays TO authenticated;
GRANT ALL ON public.guest_stays TO service_role;
ALTER TABLE public.guest_stays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view guest_stays of their businesses" ON public.guest_stays FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guest_stays.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert guest_stays for their businesses" ON public.guest_stays FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guest_stays.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update guest_stays of their businesses" ON public.guest_stays FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guest_stays.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete guest_stays of their businesses" ON public.guest_stays FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = guest_stays.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.hotel_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('transfer','room_upgrade','spa','food_beverage','activity','other')),
  name JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  unit TEXT NOT NULL CHECK (unit IN ('per_person','per_room','one_time','per_night')),
  available_from DATE,
  available_to DATE,
  min_nights INTEGER,
  daily_capacity INTEGER,
  approval_type TEXT NOT NULL DEFAULT 'reception_approval' CHECK (approval_type IN ('auto','reception_approval')),
  lead_time_hours INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_hotel_extras_business ON public.hotel_extras(business_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_extras TO authenticated;
GRANT ALL ON public.hotel_extras TO service_role;
ALTER TABLE public.hotel_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotel_extras of their businesses" ON public.hotel_extras FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = hotel_extras.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert hotel_extras for their businesses" ON public.hotel_extras FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = hotel_extras.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update hotel_extras of their businesses" ON public.hotel_extras FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = hotel_extras.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete hotel_extras of their businesses" ON public.hotel_extras FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = hotel_extras.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.extra_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  guest_stay_id UUID REFERENCES public.guest_stays(id) ON DELETE SET NULL,
  hotel_extra_id UUID NOT NULL REFERENCES public.hotel_extras(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  requested_for_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','cancelled')),
  note TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_extra_requests_business ON public.extra_requests(business_id);
CREATE INDEX idx_extra_requests_guest ON public.extra_requests(guest_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.extra_requests TO authenticated;
GRANT ALL ON public.extra_requests TO service_role;
ALTER TABLE public.extra_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view extra_requests of their businesses" ON public.extra_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = extra_requests.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert extra_requests for their businesses" ON public.extra_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = extra_requests.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update extra_requests of their businesses" ON public.extra_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = extra_requests.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete extra_requests of their businesses" ON public.extra_requests FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = extra_requests.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.whatsapp_channels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('twilio','360dialog')),
  provider_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  category TEXT NOT NULL CHECK (category IN ('utility','marketing','authentication','service','freeform')),
  recipient_country TEXT,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','read','failed')),
  error_code TEXT,
  error_message TEXT,
  cost_estimate NUMERIC(10,6) NOT NULL DEFAULT 0,
  cost_currency TEXT NOT NULL DEFAULT 'USD',
  provider_fee NUMERIC(10,6) NOT NULL DEFAULT 0,
  meta_fee NUMERIC(10,6) NOT NULL DEFAULT 0,
  service_window_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_whatsapp_messages_business_created ON public.whatsapp_messages(business_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_guest_created ON public.whatsapp_messages(guest_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_provider_msg ON public.whatsapp_messages(provider_message_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view whatsapp_messages of their businesses" ON public.whatsapp_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_messages.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert whatsapp_messages for their businesses" ON public.whatsapp_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_messages.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update whatsapp_messages of their businesses" ON public.whatsapp_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_messages.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete whatsapp_messages of their businesses" ON public.whatsapp_messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = whatsapp_messages.business_id AND b.user_id = auth.uid()));

CREATE TABLE public.conversation_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.whatsapp_channels(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversation_windows_guest_expires ON public.conversation_windows(guest_id, expires_at DESC);
CREATE INDEX idx_conversation_windows_business ON public.conversation_windows(business_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_windows TO authenticated;
GRANT ALL ON public.conversation_windows TO service_role;
ALTER TABLE public.conversation_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversation_windows of their businesses" ON public.conversation_windows FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = conversation_windows.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can insert conversation_windows for their businesses" ON public.conversation_windows FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = conversation_windows.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can update conversation_windows of their businesses" ON public.conversation_windows FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = conversation_windows.business_id AND b.user_id = auth.uid()));
CREATE POLICY "Users can delete conversation_windows of their businesses" ON public.conversation_windows FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = conversation_windows.business_id AND b.user_id = auth.uid()));

CREATE TRIGGER set_whatsapp_channels_updated_at BEFORE UPDATE ON public.whatsapp_channels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_whatsapp_templates_updated_at BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_guests_updated_at BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_hotel_extras_updated_at BEFORE UPDATE ON public.hotel_extras
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
