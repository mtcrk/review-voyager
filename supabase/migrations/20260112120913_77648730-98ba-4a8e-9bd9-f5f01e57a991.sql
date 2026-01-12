-- Create integration_logs table for edge function logging
CREATE TABLE public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider text NOT NULL,
  action text NOT NULL,
  status text NOT NULL,
  http_status int,
  error_code text,
  error_message text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Business owners can view their logs
CREATE POLICY "Users can view their business logs"
ON public.integration_logs
FOR SELECT
USING (business_id IN (
  SELECT id FROM public.businesses WHERE user_id = auth.uid()
));

-- RLS: Admins can view all logs
CREATE POLICY "Admins can view all logs"
ON public.integration_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role insert (no client insert)
CREATE POLICY "Service role can insert logs"
ON public.integration_logs
FOR INSERT
WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_integration_logs_business_id ON public.integration_logs(business_id);
CREATE INDEX idx_integration_logs_provider_action ON public.integration_logs(provider, action);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);