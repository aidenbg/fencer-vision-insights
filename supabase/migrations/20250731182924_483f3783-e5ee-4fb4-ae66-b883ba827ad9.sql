-- Create videos storage bucket with public access
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Remove session_id column from videos table
ALTER TABLE public.videos DROP COLUMN IF EXISTS session_id;

-- Create storage policies for videos bucket
CREATE POLICY "Videos are publicly accessible for viewing"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload to videos bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own videos in storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own videos in storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');