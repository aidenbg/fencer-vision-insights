import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Link } from 'react-router-dom';

const Upload = () => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  const handleVideoUpload = (videoUrl: string) => {
    setUploadedVideo(videoUrl);
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
                onClick={() => setUploadedVideo(null)}
              >
                Upload Another Video
              </Button>
            </div>
            
            <VideoPlayer 
              videoUrl={uploadedVideo}
              className="max-w-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;