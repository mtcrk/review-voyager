-- Create a separate table for social connection credentials (like business_credentials)
-- This table will only be accessible via service role (edge functions)
CREATE TABLE IF NOT EXISTS public.social_connection_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  social_connection_id uuid NOT NULL UNIQUE REFERENCES public.social_connections(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS with policies that deny ALL client access (like business_credentials)
ALTER TABLE public.social_connection_credentials ENABLE ROW LEVEL SECURITY;

-- Deny all client access - only service role can access
CREATE POLICY "No client access for select" ON public.social_connection_credentials
  FOR SELECT USING (false);

CREATE POLICY "No client access for insert" ON public.social_connection_credentials
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No client access for update" ON public.social_connection_credentials
  FOR UPDATE USING (false);

CREATE POLICY "No client access for delete" ON public.social_connection_credentials
  FOR DELETE USING (false);

-- Add trigger for updated_at
CREATE TRIGGER update_social_connection_credentials_updated_at
  BEFORE UPDATE ON public.social_connection_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_social_connections_updated_at();

-- Migrate existing tokens from social_connections to the new secure table
INSERT INTO public.social_connection_credentials (social_connection_id, access_token, refresh_token, expires_at)
SELECT id, access_token, refresh_token, expires_at
FROM public.social_connections
WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL
ON CONFLICT (social_connection_id) DO UPDATE SET
  access_token = EXCLUDED.access_token,
  refresh_token = EXCLUDED.refresh_token,
  expires_at = EXCLUDED.expires_at,
  updated_at = now();

-- Remove sensitive columns from social_connections table
ALTER TABLE public.social_connections 
  DROP COLUMN IF EXISTS access_token,
  DROP COLUMN IF EXISTS refresh_token,
  DROP COLUMN IF EXISTS expires_at;