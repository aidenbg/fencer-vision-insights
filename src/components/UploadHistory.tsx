import { useState, useEffect } from 'react';
import { Clock, Video, FileText, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface VideoRecord {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  analysis_status: string;
  upload_date: string;
  created_at: string;
}

interface UploadHistoryProps {
  onVideoSelect: (videoUrl: string, videoId: string) => void;
}

export function UploadHistory({ onVideoSelect }: UploadHistoryProps) {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'analyzing': return 'text-warning';
      case 'pending': return 'text-muted-foreground';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FileText className="h-4 w-4" />;
      case 'analyzing': return <Video className="h-4 w-4 animate-pulse" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'error': return <Trash2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Videos Yet</h3>
        <p className="text-muted-foreground">
          Upload your first fencing video to get started with analysis.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Previous Uploads</h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <Card 
            key={video.id} 
            className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-primary/50"
            onClick={() => onVideoSelect(video.file_url, video.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-muted ${getStatusColor(video.analysis_status)}`}>
                  {getStatusIcon(video.analysis_status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{video.filename}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(video.file_size || 0)}</span>
                    <span className={`capitalize ${getStatusColor(video.analysis_status)}`}>
                      {video.analysis_status}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm">
                View Analysis
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}