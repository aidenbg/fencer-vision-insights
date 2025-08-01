import { useState, useCallback } from 'react';
import { Upload, Video, FileX, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
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
    
    // Simulate progress during upload
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 90) progress = 90;
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ));
    }, 200);

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
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          filename: file.name,
          original_video_url: publicUrl,
          user_id: user.id
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Continue anyway - file is uploaded successfully
      }

      clearInterval(progressInterval);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploaded', progress: 100 }
          : f
      ));

      // Call onUpload callback with Supabase URL
      setTimeout(() => {
        if (onUpload) {
          onUpload(publicUrl);
        }
      }, 100);

    } catch (error) {
      clearInterval(progressInterval);
      throw error;
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
        return <Video className="h-4 w-4 animate-spin text-warning" />;
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
                
                {file.status === 'uploading' && (
                  <div className="w-32">
                    <div className="bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {Math.round(file.progress)}%
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