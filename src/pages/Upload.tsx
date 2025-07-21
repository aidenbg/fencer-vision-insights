import { useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VideoUpload } from '@/components/VideoUpload';
import { Link } from 'react-router-dom';

const Upload = () => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVideoUpload = (videoUrl: string) => {
    setUploadedVideo(videoUrl);
    setIsAnalyzing(true);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const mockStats = {
    totalTouches: 12,
    successfulTouches: 8,
    averageReactionTime: '0.42s',
    accuracy: '67%',
    dominantHand: 'Right',
    averageSpeed: '2.3 m/s'
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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Upload Your Fencing Video</h1>
            <VideoUpload onUpload={handleVideoUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Section */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Video Analysis</h2>
                
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Video Player</p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Analyzing video...</p>
                    <Progress value={progress} className="mb-2" />
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Stats Section */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
                
                {analysisComplete ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{mockStats.totalTouches}</p>
                        <p className="text-xs text-muted-foreground">Total Touches</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-green-500">{mockStats.successfulTouches}</p>
                        <p className="text-xs text-muted-foreground">Successful</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy</span>
                        <span className="text-sm font-medium">{mockStats.accuracy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Reaction Time</span>
                        <span className="text-sm font-medium">{mockStats.averageReactionTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Speed</span>
                        <span className="text-sm font-medium">{mockStats.averageSpeed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Dominant Hand</span>
                        <span className="text-sm font-medium">{mockStats.dominantHand}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {isAnalyzing ? 'Analysis in progress...' : 'Upload a video to see results'}
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
                    <Button className="w-full" variant="outline">
                      Share Results
                    </Button>
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/upload">
                        Upload Another Video
                      </Link>
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