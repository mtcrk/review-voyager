CREATE TABLE public.user_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, UPDATE ON public.user_warnings TO authenticated;
GRANT ALL ON public.user_warnings TO service_role;

ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own warnings"
  ON public.user_warnings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can dismiss their own warnings"
  ON public.user_warnings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

INSERT INTO public.user_warnings (user_id, type, title, message, action_url, action_label)
VALUES (
  'd2b5fa14-de31-4f10-98a7-cee0aaf86753',
  'warning',
  'Google İşletme Hesabınızı Bağlayın',
  'Yorumlarınızı tek ekranda toplayıp yapay zeka ile yanıtlayabilmeniz için Google İşletme hesabınızı bağlamanız gerekiyor.',
  '/settings?tab=google',
  'Şimdi Bağla'
);