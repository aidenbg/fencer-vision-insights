-- Remove AI-related columns from videos table
ALTER TABLE public.videos 
DROP COLUMN IF EXISTS detection_video_url,
DROP COLUMN IF EXISTS analysis_status;