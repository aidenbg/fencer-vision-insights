import { Swords, Upload, BarChart3, Target } from 'lucide-react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useState, useEffect } from 'react';
import { getDemoVideo, setupDemoVideo } from '@/utils/setupDemoVideo';
import demoVideo from '@/assets/demo-fencing-video.mp4';

const Index = () => {
  const [demoVideoData, setDemoVideoData] = useState<any>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'detections'>('original');

  useEffect(() => {
    loadDemoVideo();
  }, []);

  const loadDemoVideo = async () => {
    try {
      // First try to get existing demo video
      const existingDemo = await getDemoVideo();
      if (existingDemo) {
        setDemoVideoData(existingDemo);
        return;
      }

      // If no demo video exists, set it up
      setIsSettingUp(true);
      const newDemo = await setupDemoVideo();
      if (newDemo?.demoVideo) {
        setDemoVideoData(newDemo.demoVideo);
      }
    } catch (error) {
      console.error('Failed to load demo video:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6 z-10">
        <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
          About
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-primary rounded-full">
              <Swords className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Fencelytics
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12">
            AI-powered fencing analysis using object detection and action recognition models
          </p>
          
          <Button 
            variant="hero" 
            size="lg"
            asChild
            className="text-lg px-12 py-6"
          >
            <Link to="/upload">
              <Upload className="mr-3 h-6 w-6" />
              Upload Video
            </Link>
          </Button>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">See It In Action</h2>
            <Card className="p-8">
              <div className="space-y-8">
                {/* Demo Video - Full Width */}
                <div className="w-full">
                  {isSettingUp ? (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Processing demo video...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
                      </div>
                    </div>
                  ) : demoVideoData ? (
                    <VideoPlayer
                      videoUrl={demoVideoData.original_video_url}
                      bboxesVideoUrl={demoVideoData.detection_video_url}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      className="w-full"
                    />
                  ) : (
                    <VideoPlayer
                      videoUrl={demoVideo}
                      viewMode="original"
                      className="w-full"
                    />
                  )}
                </div>
                
                {/* Demo Results */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">AI Detection Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Object Detection */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-primary">Objects Detected:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Fencer 1</span>
                          <span className="text-sm text-primary">97% confidence</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Fencer 2</span>
                          <span className="text-sm text-primary">95% confidence</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Foil</span>
                          <span className="text-sm text-primary">99% confidence</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Target Area</span>
                          <span className="text-sm text-primary">92% confidence</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Recognition */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-primary">Actions Detected:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Attack</span>
                          <span className="text-sm text-primary">8 instances</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Parry</span>
                          <span className="text-sm text-primary">6 instances</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Riposte</span>
                          <span className="text-sm text-primary">4 instances</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">Lunge</span>
                          <span className="text-sm text-primary">12 instances</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
