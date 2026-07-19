import { useState } from 'react';
import { Upload, FileX, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VideoUploadProps {
  onUploaded?: (videoId: string) => void;
}

export function VideoUpload({ onUploaded }: VideoUploadProps = {}) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please enter a name for this analysis.', variant: 'destructive' });
      return;
    }
    if (!file) {
      toast({ title: 'Video required', description: 'Please choose a video file.', variant: 'destructive' });
      return;
    }

    setStatus('uploading');
    setProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userId = user?.id;
      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        userId = authData.user?.id;
      }

      const fileName = `original/${Date.now()}_${file.name}`;
      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      setProgress(70);
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(fileName);

      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          name: name.trim(),
          filename: file.name,
          original_video_url: publicUrl,
          status: 'Processing',
          user_id: userId,
        })
        .select()
        .single();
      if (dbError) throw dbError;

      setProgress(90);

      // Kick off processing (fire and forget — status updates come from DB polling)
      supabase.functions.invoke('process-video', {
        body: { video_url: publicUrl, video_id: videoData.id },
      }).catch((err) => console.error('process-video invoke failed:', err));

      setProgress(100);
      onUploaded?.(videoData.id);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatus('error');
      toast({ title: 'Upload failed', description: err.message ?? 'Something went wrong.', variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Upload Your Fencing Video</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Provide a name and upload your video for AI referee analysis.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bout vs. Smith — Round 3"
            maxLength={120}
            disabled={status === 'uploading'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Video <span className="text-destructive">*</span></Label>
          <Input
            id="file"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={status === 'uploading'}
            required
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              {file.name} — {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? (
            <><Upload className="mr-2 h-4 w-4 animate-pulse" /> Uploading…</>
          ) : status === 'error' ? (
            <><FileX className="mr-2 h-4 w-4" /> Try Again</>
          ) : (
            <><CheckCircle className="mr-2 h-4 w-4" /> Submit for Analysis</>
          )}
        </Button>

        {status === 'uploading' && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">{progress}%</p>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Requirements: MP4, MOV, or AVI • Max 100MB • Clear view of fencers</p>
      </div>
    </form>
  );
}
