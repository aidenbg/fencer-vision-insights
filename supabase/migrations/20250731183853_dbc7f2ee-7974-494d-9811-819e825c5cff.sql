-- Add URL columns for AI-processed videos
ALTER TABLE public.videos 
ADD COLUMN detections_video_url TEXT,
ADD COLUMN pose_video_url TEXT,
ADD COLUMN all_video_url TEXT;