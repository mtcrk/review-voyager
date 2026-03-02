
-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Replace handle_new_user to also notify via edge function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    'owner'
  );

  -- Auto-create a default business
  INSERT INTO public.businesses (user_id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User') || '''s Business'
  );

  -- Send notification email via edge function
  SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
    PERFORM extensions.http_post(
      url := supabase_url || '/functions/v1/notify-new-signup',
      body := jsonb_build_object(
        'user_email', new.email,
        'full_name', COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
        'created_at', new.created_at
      )::text,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      )::jsonb
    );
  END IF;

  RETURN new;
END;
$$;
