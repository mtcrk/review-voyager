ALTER TABLE public.youtube_comments
  ADD COLUMN IF NOT EXISTS sentiment text,
  ADD COLUMN IF NOT EXISTS sentiment_score numeric,
  ADD COLUMN IF NOT EXISTS sentiment_summary text,
  ADD COLUMN IF NOT EXISTS sentiment_topics jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sentiment_translated_text text,
  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_youtube_comments_business_sentiment
  ON public.youtube_comments(business_id, sentiment);