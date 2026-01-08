-- Add explicit RLS policies to business_credentials table
-- These policies ensure NO client-side access is possible
-- Only edge functions with service role can access this table

-- Policy: Deny all SELECT from clients (service role bypasses RLS)
CREATE POLICY "No client access for select"
ON public.business_credentials
FOR SELECT
USING (false);

-- Policy: Deny all INSERT from clients
CREATE POLICY "No client access for insert"
ON public.business_credentials
FOR INSERT
WITH CHECK (false);

-- Policy: Deny all UPDATE from clients
CREATE POLICY "No client access for update"
ON public.business_credentials
FOR UPDATE
USING (false);

-- Policy: Deny all DELETE from clients
CREATE POLICY "No client access for delete"
ON public.business_credentials
FOR DELETE
USING (false);