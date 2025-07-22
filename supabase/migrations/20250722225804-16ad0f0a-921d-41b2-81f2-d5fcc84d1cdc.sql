-- Drop all tables and related objects as they're no longer needed
DROP TABLE IF EXISTS public.video_analytics CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;

-- Drop the update function as it's no longer needed
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;