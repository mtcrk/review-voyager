
-- Create table: tiktok_videos
CREATE TABLE public.tiktok_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  social_connection_id uuid NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  tiktok_video_id text NOT NULL,
  caption text,
  permalink text,
  thumbnail_url text,
  published_at timestamptz,
  view_count int DEFAULT 0,
  like_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  share_count int DEFAULT 0,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for tiktok_videos
CREATE UNIQUE INDEX idx_tiktok_videos_unique ON public.tiktok_videos(business_id, tiktok_video_id);
CREATE INDEX idx_tiktok_videos_published ON public.tiktok_videos(business_id, published_at DESC);

-- Enable RLS
ALTER TABLE public.tiktok_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for tiktok_videos
CREATE POLICY "Users can view their business videos"
ON public.tiktok_videos FOR SELECT
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business videos"
ON public.tiktok_videos FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their business videos"
ON public.tiktok_videos FOR UPDATE
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their business videos"
ON public.tiktok_videos FOR DELETE
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all videos"
ON public.tiktok_videos FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table: tiktok_comments
CREATE TABLE public.tiktok_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  social_connection_id uuid NOT NULL REFERENCES public.social_connections(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.tiktok_videos(id) ON DELETE CASCADE,
  tiktok_video_id text NOT NULL,
  tiktok_comment_id text NOT NULL,
  parent_comment_id text,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  comment_text text NOT NULL,
  like_count int DEFAULT 0,
  reply_count int DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  commented_at timestamptz,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for tiktok_comments
CREATE UNIQUE INDEX idx_tiktok_comments_unique ON public.tiktok_comments(business_id, tiktok_comment_id);
CREATE INDEX idx_tiktok_comments_video ON public.tiktok_comments(business_id, tiktok_video_id);
CREATE INDEX idx_tiktok_comments_status ON public.tiktok_comments(business_id, status);
CREATE INDEX idx_tiktok_comments_date ON public.tiktok_comments(business_id, commented_at DESC);

-- Enable RLS
ALTER TABLE public.tiktok_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for tiktok_comments
CREATE POLICY "Users can view their business comments"
ON public.tiktok_comments FOR SELECT
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business comments"
ON public.tiktok_comments FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their business comments"
ON public.tiktok_comments FOR UPDATE
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their business comments"
ON public.tiktok_comments FOR DELETE
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all comments"
ON public.tiktok_comments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table: tiktok_reply_suggestions
CREATE TABLE public.tiktok_reply_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.tiktok_comments(id) ON DELETE CASCADE,
  model text NOT NULL DEFAULT 'gemini-2.5-flash',
  tone text NOT NULL DEFAULT 'friendly',
  language text NOT NULL DEFAULT 'tr',
  suggested_text text NOT NULL,
  intent text,
  confidence numeric,
  rationale text,
  safe_to_reply boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tiktok_reply_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS policies for tiktok_reply_suggestions
CREATE POLICY "Users can view their business suggestions"
ON public.tiktok_reply_suggestions FOR SELECT
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business suggestions"
ON public.tiktok_reply_suggestions FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their business suggestions"
ON public.tiktok_reply_suggestions FOR DELETE
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all suggestions"
ON public.tiktok_reply_suggestions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create table: tiktok_comment_replies
CREATE TABLE public.tiktok_comment_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  comment_id uuid NOT NULL REFERENCES public.tiktok_comments(id) ON DELETE CASCADE,
  sent_by_user_id uuid REFERENCES auth.users(id),
  reply_text text NOT NULL,
  tiktok_reply_id text,
  send_status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tiktok_comment_replies ENABLE ROW LEVEL SECURITY;

-- RLS policies for tiktok_comment_replies
CREATE POLICY "Users can view their business replies"
ON public.tiktok_comment_replies FOR SELECT
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business replies"
ON public.tiktok_comment_replies FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their business replies"
ON public.tiktok_comment_replies FOR UPDATE
USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all replies"
ON public.tiktok_comment_replies FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_tiktok_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_tiktok_videos_updated_at
BEFORE UPDATE ON public.tiktok_videos
FOR EACH ROW EXECUTE FUNCTION public.update_tiktok_tables_updated_at();

CREATE TRIGGER update_tiktok_comments_updated_at
BEFORE UPDATE ON public.tiktok_comments
FOR EACH ROW EXECUTE FUNCTION public.update_tiktok_tables_updated_at();
