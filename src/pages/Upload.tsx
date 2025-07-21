import { useState } from 'react';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { UploadHistory } from '@/components/UploadHistory';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const Upload = () => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'original' | 'detections' | 'detections-poses'>('original');

  const handleVideoUpload = async (videoUrl: string) => {
    setUploadedVideo(videoUrl);
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      // Save video to database
      const { data: videoData, error: uploadError } = await supabase
        .from('videos')
        .insert({
          filename: `video_${Date.now()}.mp4`,
          file_url: videoUrl,
          file_size: 0, // In a real implementation, this would be the actual file size
          analysis_status: 'pending'
        })
        .select()
        .single();

      if (uploadError) throw uploadError;
      setCurrentVideoId(videoData.id);

      // Start AI analysis
      await analyzeVideo(videoData.id, videoUrl);
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsAnalyzing(false);
    }
  };

  const analyzeVideo = async (videoId: string, videoUrl: string) => {
    try {
      // Update status to analyzing
      await supabase
        .from('videos')
        .update({ analysis_status: 'analyzing' })
        .eq('id', videoId);

      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { videoId, videoUrl }
      });

      if (error) throw error;

      // Update progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            return 100;
          }
          return prev + 15;
        });
      }, 800);

    } catch (error) {
      console.error('Error analyzing video:', error);
      setIsAnalyzing(false);
      
      // Update status to error
      await supabase
        .from('videos')
        .update({ analysis_status: 'error' })
        .eq('id', videoId);
    }
  };


  const mockDetections = {
    objects: [
      { name: 'Fencer 1', confidence: 97 },
      { name: 'Fencer 2', confidence: 95 },
      { name: 'Foil', confidence: 99 },
      { name: 'Target Area', confidence: 92 }
    ],
    actions: [
      { name: 'Attack', count: 8 },
      { name: 'Parry', count: 6 },
      { name: 'Riposte', count: 4 },
      { name: 'Lunge', count: 12 }
    ]
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
              <p className="text-muted-foreground mb-8">Upload your video to analyze fencing techniques and performance</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <VideoUpload onUpload={handleVideoUpload} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Video Analysis</h2>
              <VideoPlayer 
                videoUrl={uploadedVideo} 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              
              {/* Analysis Progress */}
              {isAnalyzing && (
                <Card className="mt-4 p-4">
                  <p className="text-sm font-medium mb-2">Analyzing video...</p>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </Card>
              )}
            </div>

            {/* Analysis Results Section */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Object Detection</h3>
                
                {analysisComplete ? (
                  <div className="space-y-3">
                    {mockDetections.objects.map((obj, index) => (
                      <div key={index} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">{obj.name}</span>
                        <span className="text-sm text-primary">{obj.confidence}% confidence</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {isAnalyzing ? 'Detecting objects...' : 'Upload a video to see results'}
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Action Recognition</h3>
                
                {analysisComplete ? (
                  <div className="space-y-3">
                    {mockDetections.actions.map((action, index) => (
                      <div key={index} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">{action.name}</span>
                        <span className="text-sm text-primary">{action.count} instances</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {isAnalyzing ? 'Recognizing actions...' : 'Upload a video to see results'}
                    </p>
                  </div>
                )}
              </Card>

              {analysisComplete && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      Download Report
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setUploadedVideo(null);
                        setCurrentVideoId(null);
                        setAnalysisComplete(false);
                        setViewMode('original');
                      }}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
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