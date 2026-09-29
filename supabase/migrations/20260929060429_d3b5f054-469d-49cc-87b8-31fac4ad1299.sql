REVOKE EXECUTE ON FUNCTION public.user_can_access_business(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_can_access_business(uuid, uuid) TO authenticated, service_role;