CREATE POLICY "ci_competitors_group_member_select" ON public.ci_competitors FOR SELECT TO authenticated
  USING (public.user_can_access_business(auth.uid(), business_id));