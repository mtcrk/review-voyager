ALTER TABLE public.price_fetch_log
  ADD COLUMN IF NOT EXISTS ok_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS no_prices_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_count integer NOT NULL DEFAULT 0;

CREATE TABLE public.price_source_settings (
  adapter text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.price_source_settings TO service_role;
ALTER TABLE public.price_source_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages price sources" ON public.price_source_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER price_source_settings_updated_at BEFORE UPDATE ON public.price_source_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.price_source_settings (adapter) VALUES ('etstur'),('jollytur'),('tatilsepeti'),('booking'),('serpapi')
  ON CONFLICT DO NOTHING;