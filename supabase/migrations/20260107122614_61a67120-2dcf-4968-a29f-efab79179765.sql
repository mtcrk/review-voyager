-- Create social_connections table for TikTok and future social integrations
CREATE TABLE public.social_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  username text,
  avatar_url text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scopes text[],
  connected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, provider)
);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only manage their own business connections
CREATE POLICY "Users can view their business connections"
ON public.social_connections
FOR SELECT
USING (business_id IN (
  SELECT id FROM public.businesses WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their business connections"
ON public.social_connections
FOR INSERT
WITH CHECK (business_id IN (
  SELECT id FROM public.businesses WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their business connections"
ON public.social_connections
FOR UPDATE
USING (business_id IN (
  SELECT id FROM public.businesses WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their business connections"
ON public.social_connections
FOR DELETE
USING (business_id IN (
  SELECT id FROM public.businesses WHERE user_id = auth.uid()
));

-- Admin policies
CREATE POLICY "Admins can view all connections"
ON public.social_connections
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all connections"
ON public.social_connections
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all connections"
ON public.social_connections
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_social_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_social_connections_updated_at
BEFORE UPDATE ON public.social_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_social_connections_updated_at();