-- Add session_id column to videos table for anonymous session-based isolation
ALTER TABLE public.videos 
ADD COLUMN session_id TEXT;

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Videos are publicly accessible" ON public.videos;

-- Create session-based RLS policies
CREATE POLICY "Users can view videos from their session" 
ON public.videos 
FOR SELECT 
USING (session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can insert videos with their session" 
ON public.videos 
FOR INSERT 
WITH CHECK (session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can update videos from their session" 
ON public.videos 
FOR UPDATE 
USING (session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can delete videos from their session" 
ON public.videos 
FOR DELETE 
USING (session_id = current_setting('app.session_id', true));