
-- Paketler
CREATE TABLE public.price_credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  price_try numeric(10,2) NOT NULL CHECK (price_try > 0),
  is_active boolean NOT NULL DEFAULT true,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_credit_packages TO authenticated;
GRANT ALL ON public.price_credit_packages TO service_role;
ALTER TABLE public.price_credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active packages readable" ON public.price_credit_packages FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage packages" ON public.price_credit_packages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
GRANT INSERT, UPDATE, DELETE ON public.price_credit_packages TO authenticated;
CREATE TRIGGER set_price_credit_packages_updated_at BEFORE UPDATE ON public.price_credit_packages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.price_credit_packages (name, credits, price_try, sort) VALUES
  ('25 kredi', 25, 490, 1), ('100 kredi', 100, 1490, 2), ('300 kredi', 300, 3490, 3);

-- Defter
CREATE TABLE public.price_credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  delta integer NOT NULL CHECK (delta <> 0),
  reason text NOT NULL CHECK (reason IN ('purchase','instant_query','refund','admin_grant')),
  ref_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE INDEX price_credit_ledger_biz_idx ON public.price_credit_ledger (business_id, created_at DESC);
-- Aynı ödeme (merchant_oid) iki kez kredi yükleyemez.
CREATE UNIQUE INDEX price_credit_ledger_purchase_once ON public.price_credit_ledger (ref_id) WHERE reason = 'purchase';
GRANT SELECT ON public.price_credit_ledger TO authenticated;
GRANT ALL ON public.price_credit_ledger TO service_role;
ALTER TABLE public.price_credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members read ledger" ON public.price_credit_ledger FOR SELECT TO authenticated USING (public.user_can_access_business(auth.uid(), business_id));

-- Kredi siparişleri (PayTR)
CREATE TABLE public.price_credit_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_oid text NOT NULL UNIQUE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.price_credit_packages(id),
  credits integer NOT NULL,
  amount_try numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'initiated',
  is_test boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT SELECT ON public.price_credit_orders TO authenticated;
GRANT ALL ON public.price_credit_orders TO service_role;
ALTER TABLE public.price_credit_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members read orders" ON public.price_credit_orders FOR SELECT TO authenticated USING (public.user_can_access_business(auth.uid(), business_id));

-- Anlık sorgu kayıtları
CREATE TABLE public.price_instant_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_by uuid,
  subjects jsonb NOT NULL,
  dates text[] NOT NULL,
  markets text[] NOT NULL,
  nights integer NOT NULL,
  adults integer NOT NULL,
  credits integer NOT NULL,
  refunded integer NOT NULL DEFAULT 0,
  done_chunks text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'running',
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT ON public.price_instant_queries TO authenticated;
GRANT ALL ON public.price_instant_queries TO service_role;
ALTER TABLE public.price_instant_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business members read instant queries" ON public.price_instant_queries FOR SELECT TO authenticated USING (public.user_can_access_business(auth.uid(), business_id));

ALTER TABLE public.competitor_price_snapshots ADD COLUMN IF NOT EXISTS fetch_trigger text;

-- Bakiye
CREATE OR REPLACE FUNCTION public.price_credit_balance(_business_id uuid)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT public.user_can_access_business(auth.uid(), _business_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN COALESCE((SELECT sum(delta) FROM public.price_credit_ledger WHERE business_id = _business_id), 0)::int;
END $$;
REVOKE ALL ON FUNCTION public.price_credit_balance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.price_credit_balance(uuid) TO authenticated, service_role;

-- Atomik düşüm: kilit + bakiye + dakikada 1 sorgu sınırı. Yalnız service role.
CREATE OR REPLACE FUNCTION public.consume_price_credits(_business_id uuid, _amount integer, _ref text, _user uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_bal int;
BEGIN
  IF _amount <= 0 OR _amount > 20 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('price_credits:' || _business_id::text));
  IF EXISTS (SELECT 1 FROM public.price_credit_ledger WHERE business_id = _business_id AND reason = 'instant_query' AND created_at > now() - interval '60 seconds') THEN
    RAISE EXCEPTION 'rate_limited';
  END IF;
  SELECT COALESCE(sum(delta), 0) INTO v_bal FROM public.price_credit_ledger WHERE business_id = _business_id;
  IF v_bal < _amount THEN RAISE EXCEPTION 'insufficient_credits'; END IF;
  INSERT INTO public.price_credit_ledger (business_id, delta, reason, ref_id, created_by, note)
  VALUES (_business_id, -_amount, 'instant_query', _ref, _user, 'Anlık fiyat sorgusu');
  RETURN v_bal - _amount;
END $$;
REVOKE ALL ON FUNCTION public.consume_price_credits(uuid, integer, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_price_credits(uuid, integer, text, uuid) TO service_role;
