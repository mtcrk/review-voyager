-- Make business_id nullable in social_connections to allow user-level connections
ALTER TABLE public.social_connections ALTER COLUMN business_id DROP NOT NULL;

-- Add user_id column for user-level connections
ALTER TABLE public.social_connections ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS policies to also allow users to manage their own user-level connections
DROP POLICY IF EXISTS "Users can view their business connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can insert their business connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can update their business connections" ON public.social_connections;
DROP POLICY IF EXISTS "Users can delete their business connections" ON public.social_connections;

CREATE POLICY "Users can view their connections" 
ON public.social_connections 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their connections" 
ON public.social_connections 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their connections" 
ON public.social_connections 
FOR UPDATE 
USING (
  auth.uid() = user_id OR
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their connections" 
ON public.social_connections 
FOR DELETE 
USING (
  auth.uid() = user_id OR
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);