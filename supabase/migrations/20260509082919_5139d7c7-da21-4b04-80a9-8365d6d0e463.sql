CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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