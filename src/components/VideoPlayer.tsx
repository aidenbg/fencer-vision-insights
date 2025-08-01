import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoUrl: string;
  detectionsVideoUrl?: string | null;
  poseVideoUrl?: string | null;
  allVideoUrl?: string | null;
  className?: string;
}

export const VideoPlayer = ({ videoUrl, detectionsVideoUrl, poseVideoUrl, allVideoUrl, className = "" }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetections, setShowDetections] = useState(false);
  const [showPoses, setShowPoses] = useState(false);

  // Get the current video URL based on toggle states
  const getCurrentVideoUrl = () => {
    if (showDetections && showPoses && allVideoUrl) {
      return allVideoUrl;
    } else if (showDetections && detectionsVideoUrl) {
      return detectionsVideoUrl;
    } else if (showPoses && poseVideoUrl) {
      return poseVideoUrl;
    }
    return videoUrl;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // Space key functionality
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const time = value[0];
    video.currentTime = time;
    setCurrentTime(time);
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    setCurrentTime(0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-card rounded-lg overflow-hidden ${className}`}>
      {/* AI Toggle Controls */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Button 
            variant={showDetections ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setShowDetections(!showDetections)}
            disabled={!detectionsVideoUrl}
          >
            +Detections
          </Button>
          <Button 
            variant={showPoses ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setShowPoses(!showPoses)}
            disabled={!poseVideoUrl}
          >
            +Poses
          </Button>
        </div>
      </div>
      
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-muted">
        <video
          ref={videoRef}
          src={getCurrentVideoUrl()}
          className="absolute inset-0 w-full h-full"
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
          playsInline
        />
      </div>
      
      <div className="p-4 space-y-3">
        {/* Progress Bar */}
        <Slider
          value={[currentTime]}
          max={duration || 0}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={restart}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            
          </div>
          
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
