
-- plans
CREATE TABLE public.plans (
  id uuid primary key default gen_random_uuid(),
  segment text not null check (segment in ('hotel','restaurant','salon','clinic')),
  plan_code text not null unique,
  label text not null,
  base_amount numeric(10,2) not null,
  unit_type text not null check (unit_type in ('flat','per_location')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans readable by everyone" ON public.plans FOR SELECT USING (true);

-- addons
CREATE TABLE public.addons (
  id uuid primary key default gen_random_uuid(),
  addon_code text not null unique,
  label text not null,
  amount numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.addons TO anon, authenticated;
GRANT ALL ON public.addons TO service_role;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addons readable by everyone" ON public.addons FOR SELECT USING (true);

-- Seed
INSERT INTO public.plans (segment, plan_code, label, base_amount, unit_type) VALUES
  ('hotel',      'hotel_flat',       'Otel',                              2990.00, 'flat'),
  ('restaurant', 'restaurant_base',  'Restoran (lokasyon başına)',         990.00, 'per_location'),
  ('salon',      'salon_flat',       'Kuaför / Güzellik / Spor Salonu',    490.00, 'flat'),
  ('clinic',     'clinic_flat',      'Klinik (Diş, Veteriner, Sağlık)',   1490.00, 'flat');

INSERT INTO public.addons (addon_code, label, amount) VALUES
  ('competitor_analysis', 'Rakip Analizi Paketi',    990.00),
  ('ai_visibility',       'AI Görünürlük Modülleri', 490.00);

-- Extend subscription_billing (this project's subscriptions table)
ALTER TABLE public.subscription_billing
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id),
  ADD COLUMN IF NOT EXISTS location_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS computed_total numeric(10,2),
  ADD COLUMN IF NOT EXISTS addon_codes text[] NOT NULL DEFAULT '{}';

-- Extend paytr_payment_log so notification can carry these to subscription_billing
ALTER TABLE public.paytr_payment_log
  ADD COLUMN IF NOT EXISTS plan_id uuid,
  ADD COLUMN IF NOT EXISTS location_count integer,
  ADD COLUMN IF NOT EXISTS computed_total numeric(10,2),
  ADD COLUMN IF NOT EXISTS addon_codes text[];
