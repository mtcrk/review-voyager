
-- Reply logs table to track every reply sent
CREATE TABLE public.reply_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reply_text TEXT NOT NULL,
  tone TEXT DEFAULT 'friendly',
  reply_source TEXT DEFAULT 'manual',
  google_status TEXT,
  response_time_hours NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.reply_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business reply logs"
  ON public.reply_logs FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business reply logs"
  ON public.reply_logs FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role insert for reply logs"
  ON public.reply_logs FOR INSERT
  WITH CHECK (true);
