-- 1) Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2) Migrate existing roles (preserve current distribution)
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.role FROM public.profiles p
WHERE p.role IS NOT NULL AND p.user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 3) has_role now reads user_roles only
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ur.role FROM public.user_roles ur
  WHERE ur.user_id = $1
  ORDER BY CASE ur.role WHEN 'admin' THEN 1 WHEN 'owner' THEN 2 ELSE 3 END
  LIMIT 1;
$$;

-- 4) Block role writes on profiles by regular users
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Rol değiştirilemez' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role ON public.profiles;
CREATE TRIGGER profiles_guard_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_role();

-- 5) New signups get default role in both places
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;

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
$$;