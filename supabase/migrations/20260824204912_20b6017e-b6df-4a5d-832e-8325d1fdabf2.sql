-- 1) Group tables
CREATE TABLE IF NOT EXISTS public.business_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_groups TO authenticated;
GRANT ALL ON public.business_groups TO service_role;
ALTER TABLE public.business_groups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE TYPE public.business_group_role AS ENUM ('group_admin', 'property_user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.business_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.business_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.business_group_role NOT NULL DEFAULT 'property_user',
  business_id uuid NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS business_group_members_uniq
  ON public.business_group_members (group_id, user_id, COALESCE(business_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX IF NOT EXISTS business_group_members_user_idx ON public.business_group_members (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_group_members TO authenticated;
GRANT ALL ON public.business_group_members TO service_role;
ALTER TABLE public.business_group_members ENABLE ROW LEVEL SECURITY;

-- 2) businesses.group_id (additive, nullable)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS group_id uuid NULL REFERENCES public.business_groups(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS businesses_group_id_idx ON public.businesses (group_id);

-- 3) SECURITY DEFINER helpers (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_group_members m
    WHERE m.user_id = _user_id AND m.group_id = _group_id AND m.role = 'group_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_admin_group_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.group_id FROM public.business_group_members m
  WHERE m.user_id = auth.uid() AND m.role = 'group_admin';
$$;

CREATE OR REPLACE FUNCTION public.can_view_business(_business_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = _business_id
      AND b.group_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.business_group_members m
        WHERE m.user_id = auth.uid() AND m.group_id = b.group_id AND m.role = 'group_admin'
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.my_admin_group_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_business(uuid) TO authenticated, service_role;

-- 4) Policies for new tables
CREATE POLICY "Group owners manage their groups" ON public.business_groups
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid() OR public.is_group_admin(auth.uid(), id))
  WITH CHECK (owner_user_id = auth.uid() OR public.is_group_admin(auth.uid(), id));

CREATE POLICY "Members can view own membership" ON public.business_group_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Group admins view group memberships" ON public.business_group_members
  FOR SELECT TO authenticated
  USING (public.is_group_admin(auth.uid(), group_id));

CREATE POLICY "Group admins manage memberships" ON public.business_group_members
  FOR ALL TO authenticated
  USING (public.is_group_admin(auth.uid(), group_id))
  WITH CHECK (public.is_group_admin(auth.uid(), group_id));

-- 5) ADDITIVE permissive SELECT policies (existing ones untouched)
CREATE POLICY "Group admins can view group businesses" ON public.businesses
  FOR SELECT TO authenticated
  USING (group_id IS NOT NULL AND public.is_group_admin(auth.uid(), group_id));

CREATE POLICY "Group admins can view group reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (public.can_view_business(business_id));

-- 6) Single-call group summary RPC
CREATE OR REPLACE FUNCTION public.group_property_summary(
  _group_id uuid,
  _from timestamptz,
  _to timestamptz
)
RETURNS TABLE(
  business_id uuid,
  business_name text,
  review_count integer,
  avg_rating numeric,
  reply_rate numeric,
  avg_reply_hours numeric,
  prev_review_count integer,
  prev_avg_rating numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_span interval;
BEGIN
  IF NOT public.is_group_admin(auth.uid(), _group_id) THEN
    RAISE EXCEPTION 'Forbidden: group admin role required';
  END IF;

  v_span := _to - _from;

  RETURN QUERY
  SELECT
    b.id,
    b.name,
    count(r.id) FILTER (WHERE r.posted_at >= _from AND r.posted_at <= _to)::int,
    round(avg(r.rating) FILTER (WHERE r.posted_at >= _from AND r.posted_at <= _to)::numeric, 2),
    CASE WHEN count(r.id) FILTER (WHERE r.posted_at >= _from AND r.posted_at <= _to) > 0
      THEN round(
        (count(r.id) FILTER (WHERE r.posted_at >= _from AND r.posted_at <= _to
            AND (r.replied_at IS NOT NULL OR r.approved_reply IS NOT NULL OR r.status = 'replied')))::numeric
        * 100 / count(r.id) FILTER (WHERE r.posted_at >= _from AND r.posted_at <= _to), 1)
      ELSE 0 END,
    round(avg(EXTRACT(EPOCH FROM (r.replied_at - r.posted_at)) / 3600)
      FILTER (WHERE r.posted_at >= _from AND r.posted_at <= _to AND r.replied_at IS NOT NULL)::numeric, 1),
    count(r.id) FILTER (WHERE r.posted_at >= (_from - v_span) AND r.posted_at < _from)::int,
    round(avg(r.rating) FILTER (WHERE r.posted_at >= (_from - v_span) AND r.posted_at < _from)::numeric, 2)
  FROM public.businesses b
  LEFT JOIN public.reviews r ON r.business_id = b.id
  WHERE b.group_id = _group_id
  GROUP BY b.id, b.name
  ORDER BY b.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.group_property_summary(uuid, timestamptz, timestamptz) TO authenticated, service_role;

CREATE TRIGGER set_business_groups_updated_at BEFORE UPDATE ON public.business_groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_business_group_members_updated_at BEFORE UPDATE ON public.business_group_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();