-- Add user_id column to videos table
ALTER TABLE public.videos 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing videos to use a placeholder user (optional - or you can leave them as null and handle in app)
-- We'll leave existing videos as null for now

-- Drop old session-based RLS policies
DROP POLICY IF EXISTS "Users can view videos from their session" ON public.videos;
DROP POLICY IF EXISTS "Users can insert videos with their session" ON public.videos;
DROP POLICY IF EXISTS "Users can update videos from their session" ON public.videos;
DROP POLICY IF EXISTS "Users can delete videos from their session" ON public.videos;

-- Create new user-based RLS policies
CREATE POLICY "Users can view their own videos or videos without user_id" 
ON public.videos 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can insert their own videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" 
ON public.videos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" 
ON public.videos 
FOR DELETE 
USING (auth.uid() = user_id);