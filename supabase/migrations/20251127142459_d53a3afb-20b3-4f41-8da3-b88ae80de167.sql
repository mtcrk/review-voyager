-- Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  place_id TEXT,
  language TEXT DEFAULT 'en',
  tone TEXT DEFAULT 'friendly',
  google_account_id TEXT,
  google_location_id TEXT,
  google_refresh_token TEXT,
  google_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses"
  ON public.businesses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses"
  ON public.businesses FOR DELETE
  USING (auth.uid() = user_id);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  google_review_id TEXT,
  google_review_name TEXT,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  summary TEXT,
  sentiment TEXT,
  issues JSONB DEFAULT '[]'::jsonb,
  praises JSONB DEFAULT '[]'::jsonb,
  suggested_reply TEXT,
  approved_reply TEXT,
  status TEXT DEFAULT 'pending_reply',
  reply_source TEXT,
  google_reply_status TEXT,
  google_reply_error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  replied_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Users can view reviews of their businesses"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reviews for their businesses"
  ON public.reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reviews of their businesses"
  ON public.reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reviews of their businesses"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX idx_reviews_posted_at ON public.reviews(posted_at DESC);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);