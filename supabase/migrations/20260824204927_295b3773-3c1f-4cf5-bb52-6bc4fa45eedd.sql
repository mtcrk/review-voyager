REVOKE EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.my_admin_group_ids() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.can_view_business(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.group_property_summary(uuid, timestamptz, timestamptz) FROM anon, public;