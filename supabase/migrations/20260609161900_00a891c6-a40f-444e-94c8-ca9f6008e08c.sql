
CREATE TABLE public.blocked_email_domains (
  domain text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blocked_email_domains TO authenticated;
GRANT ALL ON public.blocked_email_domains TO service_role;
ALTER TABLE public.blocked_email_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage blocked domains" ON public.blocked_email_domains
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.blocked_email_domains(domain, reason) VALUES ('botsepeti.net','disposable email');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_domain text;
BEGIN
  v_domain := lower(split_part(new.email, '@', 2));
  IF EXISTS (SELECT 1 FROM public.blocked_email_domains WHERE domain = v_domain) THEN
    RAISE EXCEPTION 'Email domain % is not allowed', v_domain USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    'owner'
  );

  INSERT INTO public.businesses (user_id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User') || '''s Business'
  );

  PERFORM net.http_post(
    url := 'https://pnpuhewfoxssmbpryart.supabase.co/functions/v1/notify-new-signup',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object(
      'user_email', new.email,
      'full_name', COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
      'created_at', new.created_at
    )
  );

  RETURN new;
END;
$function$;
