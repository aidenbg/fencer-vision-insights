-- Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public) VALUES ('demo-videos', 'demo-videos', true);

-- Create policies for demo videos bucket
CREATE POLICY "Demo videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'demo-videos');

CREATE POLICY "Allow demo video uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'demo-videos');

-- Create a demo_videos table to store demo video metadata
CREATE TABLE public.demo_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  original_video_url TEXT NOT NULL,
  detection_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for demo_videos (make it publicly readable)
ALTER TABLE public.demo_videos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to demo videos
CREATE POLICY "Demo videos are publicly viewable" 
ON public.demo_videos 
FOR SELECT 
USING (true);