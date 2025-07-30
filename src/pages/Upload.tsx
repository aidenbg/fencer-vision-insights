import { useState } from 'react';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Upload = () => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'original' | 'detections'>('original');
  const [bboxesVideoUrl, setBboxesVideoUrl] = useState<string | null>(null);

  // Ensure anonymous authentication
  const ensureAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    }
  };

  const handleVideoUpload = async (videoUrl: string) => {
    setUploadedVideo(videoUrl);
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Ensure user is authenticated (anonymous)
      await ensureAuth();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication failed');

      // Create video record in database with user ID
      const { data: videoRecord, error: insertError } = await supabase
        .from('videos')
        .insert({
          filename: `video_${Date.now()}.mp4`,
          original_video_url: videoUrl,
          analysis_status: 'pending',
          user_id: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      setCurrentVideoId(videoRecord.id);
      
      // Start AI analysis
      await analyzeVideo(videoRecord.id, videoUrl);
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsAnalyzing(false);
      setAnalysisError(error.message || 'Failed to upload video');
    }
  };

  const analyzeVideo = async (videoId: string, videoUrl: string) => {
    try {
      // Start progress simulation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Stop at 90% until analysis completes
          }
          return prev + 15;
        });
      }, 800);

      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { 
          videoId, 
          videoUrl
        }
      });

      if (error) throw error;
      
      // Analysis completed successfully
      clearInterval(interval);
      setProgress(100);
      
      // Fetch updated video data
      const { data: videoData, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (fetchError) throw fetchError;
      
      // Set the detection video URL from the database
      if (videoData.detection_video_url) {
        setBboxesVideoUrl(videoData.detection_video_url);
      }
      
      // Complete the analysis
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      
      // Automatically download the detection video with a slight delay
      if (videoData.detection_video_url) {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = videoData.detection_video_url;
          link.download = `analysis_${videoData.filename}`;
          link.style.display = 'none'; // Ensure it's invisible
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 500); // Small delay to let the UI settle
      }

    } catch (error) {
      console.error('Error analyzing video:', error);
      setIsAnalyzing(false);
      setAnalysisError(error.message || 'An error occurred during video analysis');
    }
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
              <h1 className="text-3xl font-bold mb-4">Fencing Video Analysis</h1>
              <div className="bg-muted/50 p-4 rounded-lg mb-8 max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">Video Requirements:</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Side view with both fencers clearly visible in good lighting</li>
                  <li>• Stable camera showing the action and scoring area</li>
                </ul>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <VideoUpload onUpload={handleVideoUpload} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Section - Full Width */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Video Analysis</h2>
              </div>
              
              <VideoPlayer 
                videoUrl={uploadedVideo}
                bboxesVideoUrl={bboxesVideoUrl}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                className="max-w-none"
              />
            </div>
            
            {/* Controls and Status Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analysis Progress */}
              {isAnalyzing && (
                <Card className="p-4">
                  <p className="text-sm font-medium mb-2">Analyzing video...</p>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </Card>
              )}
              
              {/* Analysis Error */}
              {analysisError && (
                <Card className="p-4 border-destructive lg:col-span-2">
                  <p className="text-sm font-medium text-destructive mb-2">Analysis Error</p>
                  <p className="text-xs text-muted-foreground mb-3">{analysisError}</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAnalysisError(null);
                      setIsAnalyzing(false);
                    }}
                  >
                    Dismiss
                  </Button>
                </Card>
              )}
              
              {/* Analysis Complete */}
              {analysisComplete && (
                <Card className="p-4 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-3">Analysis Complete</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use the buttons above the video to switch between original and detection views.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setUploadedVideo(null);
                      setCurrentVideoId(null);
                      setAnalysisComplete(false);
                      setViewMode('original');
                      setBboxesVideoUrl(null);
                    }}
                  >
                    Upload Another Video
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;