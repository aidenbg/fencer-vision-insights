-- Add bboxes_video_url column to videos table
ALTER TABLE public.videos
ADD COLUMN bboxes_video_url TEXT;

-- Update the update_videos_updated_at trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_videos_updated_at') THEN
    CREATE TRIGGER update_videos_updated_at
      BEFORE UPDATE ON public.videos
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;