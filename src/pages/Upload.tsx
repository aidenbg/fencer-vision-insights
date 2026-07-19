import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, CheckCircle2, XCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface VideoData {
  id: string;
  name: string;
  filename: string;
  status: string;
  original_video_url: string;
  annotated_video_url: string | null;
  log_url: string | null;
  created_at: string;
}

const statusBadge = (status: string) => {
  if (status === 'Complete') return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Complete</Badge>;
  if (status === 'Failed') return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
  return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
};

const Upload = () => {
  const [params, setParams] = useSearchParams();
  const [video, setVideo] = useState<VideoData | null>(null);

  const videoId = params.get('id');

  // Load video (from ?id=) and poll while processing
  useEffect(() => {
    if (!videoId) {
      setVideo(null);
      return;
    }
    let cancelled = false;

    const fetchOnce = async () => {
      const { data } = await supabase.from('videos').select('*').eq('id', videoId).single();
      if (!cancelled && data) setVideo(data as VideoData);
      return data as VideoData | null;
    };

    fetchOnce();
    const interval = setInterval(async () => {
      const data = await fetchOnce();
      if (data && data.status !== 'Processing') clearInterval(interval);
    }, 2000);

    return () => { cancelled = true; clearInterval(interval); };
  }, [videoId]);

  const reset = () => {
    setVideo(null);
    setParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="p-6 border-b">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button variant="ghost" asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
          </Button>
          <div className="flex items-center gap-4">
            <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <History className="h-4 w-4" /> History
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {!videoId ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">New Analysis</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload a fencing video and our AI referee will analyze the action and generate a call log.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <VideoUpload onUploaded={(id) => setParams({ id })} />
            </div>
          </div>
        ) : !video ? (
          <div className="text-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Loading analysis…
          </div>
        ) : video.status === 'Processing' ? (
          <ProcessingScreen video={video} onCancel={reset} />
        ) : (
          <ResultsScreen video={video} onNew={reset} />
        )}
      </div>
    </div>
  );
};

function ProcessingScreen({ video, onCancel }: { video: VideoData; onCancel: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis in Progress</h2>
        <Button variant="outline" onClick={onCancel}>New Upload</Button>
      </div>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {statusBadge(video.status)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Name</span>
          <span className="font-medium">{video.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Uploaded</span>
          <span className="font-medium">{new Date(video.created_at).toLocaleString()}</span>
        </div>
        <div className="pt-4 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>The AI referee is reviewing your footage…</span>
        </div>
      </Card>
    </div>
  );
}

function ResultsScreen({ video, onNew }: { video: VideoData; onNew: () => void }) {
  const failed = video.status === 'Failed';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{video.name}</h2>
            {statusBadge(video.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            Uploaded {new Date(video.created_at).toLocaleString()}
          </p>
        </div>
        <Button variant="outline" onClick={onNew}>Upload Another Video</Button>
      </div>

      {failed && (
        <Card className="p-4 border-destructive">
          <p className="text-sm text-destructive">Processing failed. Please try uploading again.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Original</h3>
          <VideoPlayer videoUrl={video.original_video_url} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Annotated Referee</h3>
          {video.annotated_video_url ? (
            <VideoPlayer videoUrl={video.annotated_video_url} />
          ) : (
            <Card className="aspect-video flex items-center justify-center text-muted-foreground">
              Not available
            </Card>
          )}
        </div>
      </div>

      {video.log_url && (
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Referee Log</p>
            <p className="text-sm text-muted-foreground">Full text log of the AI referee's calls.</p>
          </div>
          <Button asChild>
            <a href={video.log_url} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Download .txt
            </a>
          </Button>
        </Card>
      )}
    </div>
  );
}

export default Upload;
