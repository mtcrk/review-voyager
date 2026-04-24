-- YouTube videos table
CREATE TABLE public.youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  youtube_video_id text NOT NULL,
  title text,
  description text,
  channel_id text,
  channel_title text,
  thumbnail_url text,
  permalink text,
  published_at timestamptz,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, youtube_video_id)
);

CREATE INDEX idx_youtube_videos_business ON public.youtube_videos(business_id);

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business youtube videos"
  ON public.youtube_videos FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business youtube videos"
  ON public.youtube_videos FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their business youtube videos"
  ON public.youtube_videos FOR UPDATE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their business youtube videos"
  ON public.youtube_videos FOR DELETE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all youtube videos"
  ON public.youtube_videos FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- YouTube comments table
CREATE TABLE public.youtube_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  video_id uuid NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  youtube_video_id text NOT NULL,
  youtube_comment_id text NOT NULL,
  author_display_name text,
  author_channel_id text,
  author_avatar_url text,
  comment_text text NOT NULL,
  like_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  commented_at timestamptz,
  status text NOT NULL DEFAULT 'open',
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, youtube_comment_id)
);

CREATE INDEX idx_youtube_comments_business ON public.youtube_comments(business_id);
CREATE INDEX idx_youtube_comments_video ON public.youtube_comments(video_id);

ALTER TABLE public.youtube_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business youtube comments"
  ON public.youtube_comments FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their business youtube comments"
  ON public.youtube_comments FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their business youtube comments"
  ON public.youtube_comments FOR UPDATE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their business youtube comments"
  ON public.youtube_comments FOR DELETE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all youtube comments"
  ON public.youtube_comments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));