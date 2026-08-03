-- a) businesses.vertical
ALTER TABLE public.businesses
  ADD COLUMN vertical text NOT NULL DEFAULT 'hotel';
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_vertical_check
  CHECK (vertical IN ('hotel','restaurant','clinic','cafe','salon'));

-- b) reviews analysis bookkeeping
ALTER TABLE public.reviews
  ADD COLUMN analysis_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN analysis_attempts int NOT NULL DEFAULT 0,
  ADD COLUMN analysis_error text,
  ADD COLUMN analysis_version int;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_analysis_status_check
  CHECK (analysis_status IN ('pending','done','failed','skipped'));

CREATE INDEX idx_reviews_analysis_queue
  ON public.reviews (analysis_status, business_id)
  WHERE analysis_status IN ('pending','failed');

UPDATE public.reviews
  SET analysis_status = 'skipped'
  WHERE text IS NULL OR length(btrim(text)) < 15;

-- c) review_analysis
CREATE TABLE public.review_analysis (
  review_id uuid PRIMARY KEY REFERENCES public.reviews(id) ON DELETE CASCADE,
  business_id uuid NOT NULL,
  overall_sentiment numeric NOT NULL,
  sentiment_label text NOT NULL,
  detected_language text,
  summary text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  prompt_version int,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_analysis
  ADD CONSTRAINT review_analysis_sentiment_label_check
  CHECK (sentiment_label IN ('positive','neutral','negative','mixed'));

CREATE INDEX idx_review_analysis_business_analyzed
  ON public.review_analysis (business_id, analyzed_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_analysis TO authenticated;
GRANT ALL ON public.review_analysis TO service_role;

ALTER TABLE public.review_analysis ENABLE ROW LEVEL SECURITY;

-- Mirror the ownership shape used by public.reviews
CREATE POLICY "Users can view review analysis of their businesses"
  ON public.review_analysis FOR SELECT
  USING (business_id IN (SELECT businesses.id FROM public.businesses WHERE businesses.user_id = auth.uid()));

CREATE POLICY "Users can insert review analysis for their businesses"
  ON public.review_analysis FOR INSERT
  WITH CHECK (business_id IN (SELECT businesses.id FROM public.businesses WHERE businesses.user_id = auth.uid()));

CREATE POLICY "Users can update review analysis of their businesses"
  ON public.review_analysis FOR UPDATE
  USING (business_id IN (SELECT businesses.id FROM public.businesses WHERE businesses.user_id = auth.uid()));

CREATE POLICY "Users can delete review analysis of their businesses"
  ON public.review_analysis FOR DELETE
  USING (business_id IN (SELECT businesses.id FROM public.businesses WHERE businesses.user_id = auth.uid()));

CREATE POLICY "Admins can view all review analysis"
  ON public.review_analysis FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all review analysis"
  ON public.review_analysis FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all review analysis"
  ON public.review_analysis FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "review_analysis_service_write"
  ON public.review_analysis FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);