import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoUrl: string;
  bboxesVideoUrl?: string | null;
  className?: string;
  viewMode?: 'original' | 'detections';
  onViewModeChange?: (mode: 'original' | 'detections') => void;
}

export const VideoPlayer = ({ videoUrl, bboxesVideoUrl, className = "", viewMode = 'original', onViewModeChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectionsVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get the currently active video element
  const getCurrentVideo = () => {
    return viewMode === 'detections' && bboxesVideoUrl && detectionsVideoRef.current 
      ? detectionsVideoRef.current 
      : videoRef.current;
  };


  // Sync videos when switching modes
  useEffect(() => {
    const originalVideo = videoRef.current;
    const detectionsVideo = detectionsVideoRef.current;
    
    if (originalVideo && detectionsVideo && bboxesVideoUrl) {
      if (viewMode === 'detections') {
        // Sync detections video to original video time
        detectionsVideo.currentTime = originalVideo.currentTime;
        detectionsVideo.muted = originalVideo.muted;
        if (!originalVideo.paused) {
          detectionsVideo.play();
        }
      } else {
        // Sync original video to detections video time  
        originalVideo.currentTime = detectionsVideo.currentTime;
        originalVideo.muted = detectionsVideo.muted;
        if (!detectionsVideo.paused) {
          originalVideo.play();
        }
      }
    }
  }, [viewMode, bboxesVideoUrl]);

  useEffect(() => {
    const video = getCurrentVideo();
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [viewMode, bboxesVideoUrl]);

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
    const video = getCurrentVideo();
    if (!video) return;

    if (isPlaying) {
      video.pause();
      // Pause the other video too
      const otherVideo = viewMode === 'detections' ? videoRef.current : detectionsVideoRef.current;
      if (otherVideo) otherVideo.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = getCurrentVideo();
    if (!video) return;
    
    const time = value[0];
    video.currentTime = time;
    setCurrentTime(time);
    
    // Sync the other video too
    const otherVideo = viewMode === 'detections' ? videoRef.current : detectionsVideoRef.current;
    if (otherVideo) {
      otherVideo.currentTime = time;
    }
  };

  const restart = () => {
    const video = getCurrentVideo();
    if (!video) return;
    
    video.currentTime = 0;
    setCurrentTime(0);
    
    // Restart the other video too
    const otherVideo = viewMode === 'detections' ? videoRef.current : detectionsVideoRef.current;
    if (otherVideo) {
      otherVideo.currentTime = 0;
    }
  };

  const toggleMute = () => {
    const video = getCurrentVideo();
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
    
    // Sync the other video too
    const otherVideo = viewMode === 'detections' ? videoRef.current : detectionsVideoRef.current;
    if (otherVideo) {
      otherVideo.muted = video.muted;
    }
  };

  const toggleFullscreen = () => {
    const video = getCurrentVideo();
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
      {/* View Mode Selector */}
      {onViewModeChange && (
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'original' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('original')}
            >
              Original
            </Button>
            <Button 
              variant={viewMode === 'detections' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('detections')}
            >
              Detections
            </Button>
          </div>
        </div>
      )}
      
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-muted">
        {/* Original Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={`absolute inset-0 w-full h-full ${viewMode === 'original' ? 'block' : 'hidden'}`}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
        
        {/* Detections Video */}
        {bboxesVideoUrl && (
          <video
            ref={detectionsVideoRef}
            src={bboxesVideoUrl}
            className={`absolute inset-0 w-full h-full ${viewMode === 'detections' ? 'block' : 'hidden'}`}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
        )}
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
