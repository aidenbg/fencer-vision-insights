import { Swords, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useState } from 'react';
import demoVideo from '@/assets/demo-fencing-video.mp4';
import demoDetectionsVideo from '@/assets/demo-fencing-detections.mp4';

const Index = () => {
  
  
  // Direct video URLs
  const originalVideoUrl = demoVideo;
  const detectionsVideoUrl = demoDetectionsVideo;

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
            <h2 className="text-3xl font-bold text-center mb-12">Demo</h2>
            <Card className="p-8">
              <div className="space-y-8">
                {/* Demo Video - Full Width */}
                <div className="w-full">
                  <VideoPlayer
                    videoUrl={originalVideoUrl}
                    detectionsVideoUrl={detectionsVideoUrl}
                    className="w-full"
                  />
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
