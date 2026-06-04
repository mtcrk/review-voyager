CREATE TABLE public.user_first_action_notified (
  user_id UUID PRIMARY KEY,
  email TEXT,
  action TEXT,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.user_first_action_notified TO authenticated;
GRANT ALL ON public.user_first_action_notified TO service_role;
ALTER TABLE public.user_first_action_notified ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service writes" ON public.user_first_action_notified FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "admin reads" ON public.user_first_action_notified FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));