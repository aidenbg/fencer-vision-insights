import { useState, useCallback } from 'react';
import { Upload, Video, FileX, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const videoFiles = droppedFiles.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      handleFiles(videoFiles);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'uploaded', progress: 100 }
            : f
        ));
        
        // Call onUpload callback when upload is complete
        if (onUpload) {
          const file = files.find(f => f.id === fileId);
          if (file) {
            onUpload(`/mock-video-${fileId}.mp4`);
          }
        }
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress }
            : f
        ));
      }
    }, 200);
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
      <Card 
        className={cn(
          "relative border-2 border-dashed transition-all duration-300",
          isDragOver 
            ? "border-primary bg-primary/5 scale-105" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-4">
            <Video className="h-10 w-10 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Upload Fencing Videos</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your fencing videos here, or click to browse
          </p>
          
          <div className="space-y-2">
            <Button variant="hero" size="lg" onClick={() => document.getElementById('file-input')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Choose Videos
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={handleFileInput}
            />
            
            <p className="text-xs text-muted-foreground">
              Supports MP4, MOV, AVI up to 500MB each
            </p>
          </div>
        </div>
      </Card>

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