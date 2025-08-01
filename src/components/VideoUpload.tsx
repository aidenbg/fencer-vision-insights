import { useState, useCallback } from 'react';
import { Upload, Video, FileX, CheckCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  videoId?: string;
}

interface VideoUploadProps {
  onUpload?: (videoUrl: string) => void;
}

export function VideoUpload({ onUpload }: VideoUploadProps = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);


  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const actualFile = fileList[i];
      
      try {
        await uploadToStorage(file.id, actualFile);
      } catch (error) {
        console.error('Upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
      }
    }
  };

  const uploadToStorage = async (fileId: string, file: File) => {
    // Ensure user is authenticated (anonymous)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;
      // Wait for auth to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const fileName = `original/${Date.now()}_${file.name}`;
    

    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Insert video record into database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          filename: file.name,
          original_video_url: publicUrl,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }

      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploaded', progress: 100, videoId: videoData.id }
          : f
      ));

      // Start AI processing
      setTimeout(() => {
        processVideo(fileId, publicUrl, videoData.id);
      }, 500);

      // Call onUpload callback with Supabase URL
      setTimeout(() => {
        if (onUpload) {
          onUpload(publicUrl);
        }
      }, 100);

    } catch (error) {
      throw error;
    }
  };

  const processVideo = async (fileId: string, videoUrl: string, videoId: string) => {
    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'processing', progress: 10 }
          : f
      ));
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('process-video', {
        body: {
          video_url: videoUrl,
          video_id: videoId
        }
      });
      
      if (error) {
        console.error('Processing error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
        return;
      }

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
  
      const pollInterval = setInterval(async () => {
        attempts++;

        // Update progress based on time elapsed
        const progress = Math.min(10 + (attempts / maxAttempts) * 80, 90);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));

        // Check if processing is complete
        const { data: video } = await supabase
          .from('videos')
          .select('detections_video_url, pose_video_url, all_video_url')
          .eq('id', videoId)
          .single();

        if (video?.detections_video_url && video?.pose_video_url && video?.all_video_url) {
          clearInterval(pollInterval);
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', progress: 0 }
              : f
          ));
        }
      }, 2000); // Check every 2 seconds

    } catch (error) {
      console.error('Processing failed:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse text-primary" />;
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing':
        return <Brain className="h-4 w-4 animate-pulse text-warning" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <FileX className="h-4 w-4 text-destructive" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upload Your Fencing Video</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload your fencing videos for AI-powered analysis. Get automatic detection of fencers, weapons, and pose estimation to improve your technique.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button variant="hero" size="lg" onClick={() => document.getElementById('file-input')?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Choose Video
          </Button>
          
          <input
            id="file-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileInput}
          />
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Requirements:</p>
            <ul className="text-xs space-y-1">
              <li>• MP4, MOV, or AVI format</li>
              <li>• Maximum file size: 100MB</li>
              <li>• Clear view of fencers and weapons</li>
              <li>• Good lighting and resolution</li>
              <li>• Videos under 60 seconds process faster</li>
            </ul>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold">Uploaded Videos</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.status}
                    </p>
                  </div>
                </div>
                
                {(file.status === 'uploading' || file.status === 'processing') && (
                  <div className="w-32">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {file.status === 'processing' ? 'Analyzing' : 'Uploading'} {Math.round(file.progress)}%
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
