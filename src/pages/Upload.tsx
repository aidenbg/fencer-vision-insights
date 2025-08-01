import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface VideoData {
  id: string;
  original_video_url: string;
  detections_video_url?: string | null;
  pose_video_url?: string | null;
  all_video_url?: string | null;
}

const Upload = () => {
  const [uploadedVideo, setUploadedVideo] = useState<VideoData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleVideoUpload = async (videoUrl: string) => {
    // Find the video record in the database
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('original_video_url', videoUrl)
      .single();
    
    if (data && !error) {
      setUploadedVideo(data);
      
      // If videos aren't processed yet, start polling
      if (!data.detections_video_url) {
        setIsProcessing(true);
        setProcessingProgress(10);
        pollForProcessedVideos(data.id);
      }
    }
  };

  const pollForProcessedVideos = async (videoId: string) => {
    const maxAttempts = 60; // 2 minutes max (2 seconds per attempt)
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      
      // Update progress
      const progress = Math.min(10 + (attempts / maxAttempts) * 80, 90);
      setProcessingProgress(progress);

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (data && !error) {
        // Check if all URLs are available
        if (data.detections_video_url && data.pose_video_url && data.all_video_url) {
          setUploadedVideo(data);
          setProcessingProgress(100);
          setTimeout(() => {
            setIsProcessing(false);
          }, 500);
          clearInterval(interval);
          return;
        }
      }

      // Stop after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setIsProcessing(false);
        console.error('Processing timeout');
      }
    }, 2000); // Check every 2 seconds
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="p-6 border-b">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {!uploadedVideo ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Upload Your Video</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload your videos to view and playback. Videos are stored securely and can be played back immediately.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <VideoUpload onUpload={handleVideoUpload} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Video Player</h2>
              <Button 
                variant="outline"
                onClick={() => {
                  setUploadedVideo(null);
                  setIsProcessing(false);
                  setProcessingProgress(0);
                }}
              >
                Upload Another Video
              </Button>
            </div>

            {/* Processing Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing video with AI models...</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Analyzing fencers, weapons, and poses. This may take a minute...
                </p>
              </div>
            )}
            
            <VideoPlayer 
              videoUrl={uploadedVideo.original_video_url}
              detectionsVideoUrl={uploadedVideo.detections_video_url}
              poseVideoUrl={uploadedVideo.pose_video_url}
              allVideoUrl={uploadedVideo.all_video_url}
              className="max-w-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
