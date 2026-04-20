ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_edited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz,
  ADD COLUMN IF NOT EXISTS previous_text text,
  ADD COLUMN IF NOT EXISTS previous_rating integer;