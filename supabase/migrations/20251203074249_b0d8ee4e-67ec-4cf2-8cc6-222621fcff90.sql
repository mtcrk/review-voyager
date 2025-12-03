-- Create a separate secure table for business OAuth credentials
-- This table will only be accessible via service role (edge functions)
CREATE TABLE public.business_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  google_refresh_token text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_credentials ENABLE ROW LEVEL SECURITY;

-- NO RLS policies = only service role can access this table
-- This is intentional - refresh tokens should never be exposed to clients

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_business_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_credentials_updated_at
  BEFORE UPDATE ON public.business_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_credentials_updated_at();

-- Migrate existing tokens to new table
INSERT INTO public.business_credentials (business_id, google_refresh_token)
SELECT id, google_refresh_token 
FROM public.businesses 
WHERE google_refresh_token IS NOT NULL;

-- Remove the sensitive column from businesses table
ALTER TABLE public.businesses DROP COLUMN google_refresh_token;