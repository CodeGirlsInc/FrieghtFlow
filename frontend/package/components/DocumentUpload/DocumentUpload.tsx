'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DOCUMENT_TYPES = [
  { value: 'waybill', label: 'Waybill' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
] as const;

export interface DocumentUploadProps {
  shipmentId?: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ shipmentId, onUploadComplete }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<string>('waybill');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`${file.name} is not a supported file type.`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds the 10MB size limit.`);
      return false;
    }
    return true;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(validateFile);
    setFiles((prev) => {
      const combined = [...prev, ...validFiles];
      return combined.slice(0, 5);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFilePreview = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      if (shipmentId) formData.append('shipmentId', shipmentId);
      files.forEach((f) => formData.append('files', f));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 90));
      }, 500);

      await apiClient('/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(`${files.length} file(s) uploaded successfully!`);
      setFiles([]);
      setDocumentType('waybill');
      onUploadComplete?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="documentType">Document Type</Label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={uploading}
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <div className="text-3xl text-muted-foreground/50" aria-hidden="true">
              📄
            </div>
            <p className="text-sm font-medium text-foreground">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse — PDF, PNG, JPG (max 10MB each)
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {files.length} file(s) selected
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {files.map((file, i) => {
                const preview = getFilePreview(file);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt={`Preview of ${file.name}`}
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        PDF
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      disabled={uploading}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      aria-label={`Remove ${file.name}`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? `(${files.length} file${files.length > 1 ? 's' : ''})` : ''}`}
        </Button>
      </CardContent>
    </Card>
  );
}
