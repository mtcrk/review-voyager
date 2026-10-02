CREATE OR REPLACE FUNCTION public.price_credit_balance(_business_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  -- RLS: yalnız işletmeye erişimi olan kullanıcı defter satırlarını görür.
  SELECT COALESCE(sum(delta), 0)::int FROM public.price_credit_ledger WHERE business_id = _business_id;
$$;