
ALTER TABLE public.videos
  ADD COLUMN name TEXT NOT NULL DEFAULT 'Untitled',
  ADD COLUMN status TEXT NOT NULL DEFAULT 'Processing',
  ADD COLUMN annotated_video_url TEXT,
  ADD COLUMN log_url TEXT;

ALTER TABLE public.videos ALTER COLUMN name DROP DEFAULT;

ALTER TABLE public.videos
  DROP COLUMN IF EXISTS detections_video_url,
  DROP COLUMN IF EXISTS pose_video_url,
  DROP COLUMN IF EXISTS all_video_url;
