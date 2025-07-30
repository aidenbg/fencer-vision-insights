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

  // Ensure anonymous authentication with better error handling
  const ensureAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, signing in anonymously...');
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous sign in error:', error);
          throw new Error(`Authentication failed: ${error.message}`);
        }
        console.log('Anonymous sign in successful:', data.user?.id);
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const handleVideoUpload = async (videoUrl: string) => {
    setUploadedVideo(videoUrl);
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisError(null);
    
    try {
      // Ensure user is authenticated (anonymous)
      await ensureAuth();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication failed');

      // Extract filename from URL
      const urlParts = videoUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || `video_${Date.now()}.mp4`;

      // Create video record in database with user ID
      const { data: videoRecord, error: insertError } = await supabase
        .from('videos')
        .insert({
          filename,
          original_video_url: videoUrl,
          analysis_status: 'pending',
          user_id: user.id
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }
      
      if (!videoRecord) {
        throw new Error('Failed to create video record');
      }
      
      setCurrentVideoId(videoRecord.id);
      
      // Start AI analysis
      await analyzeVideo(videoRecord.id, videoUrl);
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsAnalyzing(false);
      const errorMessage = error.message || 'Failed to upload video';
      setAnalysisError(`Upload failed: ${errorMessage}`);
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

      // Call AI analysis edge function with better error handling
      console.log('Calling analyze-video edge function...');
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { 
          videoId, 
          videoUrl
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Analysis failed: ${error.message || 'Unknown edge function error'}`);
      }
      
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
        // Auto-switch to detections view when analysis completes
        setViewMode('detections');
      }
      
      // Complete the analysis
      setIsAnalyzing(false);
      setAnalysisComplete(true);

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
              <h1 className="text-3xl font-bold mb-4">Upload Your Video</h1>
              <div className="bg-muted/50 p-4 rounded-lg mb-8 max-w-2xl mx-auto">
                <h3 className="font-semibold mb-2">Requirements:</h3>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Clear side view with both fencers visible</li>
                  <li>• Good lighting and stable camera</li>
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
                  <div className="flex gap-2">
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
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setAnalysisError(null);
                        if (currentVideoId && uploadedVideo) {
                          analyzeVideo(currentVideoId, uploadedVideo);
                        }
                      }}
                    >
                      Retry Analysis
                    </Button>
                  </div>
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