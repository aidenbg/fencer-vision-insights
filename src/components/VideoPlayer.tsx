import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoUrl: string;
  bboxesVideoUrl?: string | null;
  className?: string;
  viewMode?: 'original' | 'detections' | 'detections-poses';
  onViewModeChange?: (mode: 'original' | 'detections' | 'detections-poses') => void;
}

export const VideoPlayer = ({ videoUrl, bboxesVideoUrl, className = "", viewMode = 'original', onViewModeChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
              + Detections
            </Button>
            <Button 
              variant={viewMode === 'detections-poses' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('detections-poses')}
            >
              + Poses
            </Button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={viewMode === 'original' || !bboxesVideoUrl ? videoUrl : bboxesVideoUrl}
        className="w-full aspect-video bg-muted"
        onEnded={() => setIsPlaying(false)}
      />
      
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
          </div>
          
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};