
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert demo requests"
ON public.demo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "No public read access"
ON public.demo_requests
FOR SELECT
TO authenticated
USING (false);
