import { useState } from 'react';
import { Play, Eye, Download, BarChart3, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VideoAnalysis {
  id: string;
  name: string;
  uploadDate: string;
  duration: string;
  status: 'processing' | 'completed' | 'failed';
  thumbnail: string;
  analysisResults?: {
    touches: number;
    averageReactionTime: number;
    accuracy: number;
    dominantHand: 'left' | 'right';
  };
}

const mockVideos: VideoAnalysis[] = [
  {
    id: '1',
    name: 'Training Session - Épée.mp4',
    uploadDate: '2024-01-15',
    duration: '3:45',
    status: 'completed',
    thumbnail: '/placeholder.svg',
    analysisResults: {
      touches: 12,
      averageReactionTime: 0.32,
      accuracy: 78,
      dominantHand: 'right'
    }
  },
  {
    id: '2',
    name: 'Competition Bout - Sabre.mp4',
    uploadDate: '2024-01-14',
    duration: '2:12',
    status: 'completed',
    thumbnail: '/placeholder.svg',
    analysisResults: {
      touches: 8,
      averageReactionTime: 0.28,
      accuracy: 85,
      dominantHand: 'right'
    }
  },
  {
    id: '3',
    name: 'Practice Round - Foil.mp4',
    uploadDate: '2024-01-13',
    duration: '4:22',
    status: 'processing',
    thumbnail: '/placeholder.svg'
  }
];

export function VideoGallery() {
  const [videos] = useState<VideoAnalysis[]>(mockVideos);
  const [selectedVideo, setSelectedVideo] = useState<VideoAnalysis | null>(null);

  const getStatusColor = (status: VideoAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'processing':
        return 'bg-warning text-white';
      case 'failed':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Video Gallery</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{videos.length} videos</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => setSelectedVideo(video)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch
                </Button>
              </div>
              
              <Badge 
                className={`absolute top-2 right-2 ${getStatusColor(video.status)}`}
              >
                {video.status}
              </Badge>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2 truncate">{video.name}</h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{video.uploadDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{video.duration}</span>
                </div>
              </div>

              {video.analysisResults && video.status === 'completed' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">{video.analysisResults.touches}</div>
                      <div className="text-muted-foreground">Touches</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-primary">{video.analysisResults.accuracy}%</div>
                      <div className="text-muted-foreground">Accuracy</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Analyze
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {video.status === 'processing' && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-xs text-muted-foreground mt-2">Processing video...</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}