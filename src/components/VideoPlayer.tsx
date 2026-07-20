import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
}

export const VideoPlayer = ({ videoUrl, className = '' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (isPlaying) video.pause(); else video.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
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
    if (!isFullscreen) video.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-card rounded-lg overflow-hidden ${className}`}>
      <div className="relative w-full aspect-video bg-muted">
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          onEnded={() => setIsPlaying(false)}
          onError={() => setError("This video couldn't be played in your browser. It may use an unsupported codec.")}
          preload="metadata"
          playsInline
          controls
        />
        {error && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-4 text-center gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline text-primary">
              Open video in new tab
            </a>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <Slider value={[currentTime]} max={duration || 0} step={0.1} onValueChange={handleSeek} className="w-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePlay} className="h-8 w-8 p-0">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={restart} className="h-8 w-8 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleMute} className="h-8 w-8 p-0">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
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
