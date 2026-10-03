CREATE TABLE public.price_base_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('own','competitor')),
  competitor_id uuid REFERENCES public.ci_competitors(id) ON DELETE CASCADE,
  source_adapter text NOT NULL,
  room_name text NOT NULL,
  determined_by text NOT NULL DEFAULT 'auto' CHECK (determined_by IN ('auto','manual')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX price_base_rooms_uniq ON public.price_base_rooms (business_id, subject_type, COALESCE(competitor_id, '00000000-0000-0000-0000-000000000000'::uuid), source_adapter);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_base_rooms TO authenticated;
GRANT ALL ON public.price_base_rooms TO service_role;
ALTER TABLE public.price_base_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business users manage base rooms" ON public.price_base_rooms FOR ALL TO authenticated
  USING (public.user_can_access_business(auth.uid(), business_id))
  WITH CHECK (public.user_can_access_business(auth.uid(), business_id));
CREATE TRIGGER price_base_rooms_updated_at BEFORE UPDATE ON public.price_base_rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();