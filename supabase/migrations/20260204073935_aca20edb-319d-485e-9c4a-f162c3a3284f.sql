-- Create story_kit_templates table for businesses to store their branding
CREATE TABLE public.story_kit_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL DEFAULT 'Varsayılan',
  hashtag TEXT,
  tagline TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  accent_color TEXT DEFAULT '#8b5cf6',
  logo_url TEXT,
  qr_code_enabled BOOLEAN DEFAULT true,
  custom_message_placeholder TEXT DEFAULT 'Deneyimimi paylaşmak istiyorum...',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create story_kit_shares table to track shares/downloads
CREATE TABLE public.story_kit_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.story_kit_templates(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_message TEXT,
  platform TEXT DEFAULT 'instagram',
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_hash TEXT -- For analytics, hashed for privacy
);

-- Enable RLS on both tables
ALTER TABLE public.story_kit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_kit_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for story_kit_templates
CREATE POLICY "Users can view their own templates"
  ON public.story_kit_templates
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their businesses"
  ON public.story_kit_templates
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own templates"
  ON public.story_kit_templates
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own templates"
  ON public.story_kit_templates
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- RLS policies for story_kit_shares
-- Allow public inserts (customers don't need to be logged in)
CREATE POLICY "Anyone can create a share record"
  ON public.story_kit_shares
  FOR INSERT
  WITH CHECK (true);

-- Business owners can view shares for their businesses
CREATE POLICY "Business owners can view their shares"
  ON public.story_kit_shares
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE user_id = auth.uid()
    )
  );

-- Public can read templates to display on share page
CREATE POLICY "Public can view active templates"
  ON public.story_kit_templates
  FOR SELECT
  USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_story_kit_templates_updated_at
  BEFORE UPDATE ON public.story_kit_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_social_connections_updated_at();