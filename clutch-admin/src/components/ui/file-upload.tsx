"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { fileService, type FileUploadOptions, type FileUploadResult } from '@/lib/file-service';
import { toast } from 'sonner';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Trash2,
  Image,
  FileText,
  Archive
} from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (results: FileUploadResult[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  accept?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  url?: string;
  fileId?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/*', 'application/pdf', 'text/csv', 'application/json'],
  accept,
  multiple = true,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);

    const newFiles: UploadedFile[] = fileArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    const uploadPromises = fileArray.map(async (file, index) => {
      const fileId = newFiles[index].id;
      
      try {
        // Validate file
        const validation = fileService.validateFile(file, { maxSize, allowedTypes });
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Update progress
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
        );

        // Upload file
        const result = await fileService.uploadFile(file, 'general', {
          maxSize,
          allowedTypes,
          onProgress: (progress) => {
            setUploadedFiles(prev => 
              prev.map(f => f.id === fileId ? { ...f, progress } : f)
            );
          }
        });

        if (result.success) {
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileId ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              url: result.fileUrl,
              fileId: result.fileId
            } : f)
          );
          return result;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'error', 
            error: errorMessage 
          } : f)
        );
        return { success: false, error: errorMessage };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
        toast.success(`${successfulUploads.length} file(s) uploaded successfully`);
      }

      if (failedUploads.length > 0) {
        const errorMessage = `${failedUploads.length} file(s) failed to upload`;
        onUploadError?.(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      // Upload error
      onUploadError?.('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles.length, maxFiles, maxSize, allowedTypes, disabled, onUploadComplete, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleDownloadFile = useCallback(async (file: UploadedFile) => {
    if (!file.fileId) return;
    
    try {
      await fileService.downloadFile(file.fileId, {
        fileName: file.name
      });
    } catch (error) {
      // Download error
      toast.error('Failed to download file');
    }
  }, []);

  const handlePreviewFile = useCallback(async (file: UploadedFile) => {
    if (!file.fileId) return;
    
    try {
      const previewUrl = await fileService.previewFile(file.fileId);
      if (previewUrl) {
        window.open(previewUrl, '_blank');
      }
    } catch (error) {
      // Preview error
      toast.error('Failed to preview file');
    }
  }, []);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      case 'uploading':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isDragging ? 'Drop files here' : 'Upload files'}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Drag and drop files here, or click to select files
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Max file size: {fileService.formatFileSize(maxSize)}</p>
            <p>Max files: {maxFiles}</p>
            <p>Allowed types: {allowedTypes.join(', ')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept || allowedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Uploaded Files</CardTitle>
            <CardDescription>
              {uploadedFiles.length} file(s) uploaded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-[0.625rem]">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fileService.formatFileSize(file.size)}
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-1 h-1" />
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(file.status)}>
                    {file.status}
                  </Badge>
                  
                  {file.status === 'completed' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-info">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info"></div>
          <span>Uploading files...</span>
        </div>
      )}
    </div>
  );
}

export default FileUpload;


