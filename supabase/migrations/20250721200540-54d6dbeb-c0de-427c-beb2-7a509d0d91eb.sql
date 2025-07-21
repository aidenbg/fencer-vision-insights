-- Create videos table to store uploaded video information
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video_analytics table to store analysis results
CREATE TABLE public.video_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  total_touches INTEGER DEFAULT 0,
  successful_touches INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0.00,
  average_reaction_time DECIMAL(5,3) DEFAULT 0.000,
  average_speed DECIMAL(5,2) DEFAULT 0.00,
  dominant_hand TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables (making them public for now since no auth)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access
CREATE POLICY "Videos are publicly accessible" ON public.videos FOR ALL USING (true);
CREATE POLICY "Analytics are publicly accessible" ON public.video_analytics FOR ALL USING (true);

-- Create trigger for updated_at timestamp on videos
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at timestamp on video_analytics  
CREATE TRIGGER update_video_analytics_updated_at
  BEFORE UPDATE ON public.video_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();