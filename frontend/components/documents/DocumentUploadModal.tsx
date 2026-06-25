'use client';

import { useCallback, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { apiClient } from '../../lib/api/client';

const DOCUMENT_TYPES = [
  'Bill of Lading',
  'Commercial Invoice',
  'Packing List',
  'Certificate of Origin',
  'Insurance Certificate',
  'Other',
];

interface SelectedFile {
  file: File;
  id: string;
}

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional shipment/entity ID to associate the document with */
  entityId?: string;
  onSuccess?: () => void;
}

export function DocumentUploadModal({ open, onOpenChange, entityId, onSuccess }: DocumentUploadModalProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: SelectedFile[] = Array.from(incoming).map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}`,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file.');
      return;
    }

    const formData = new FormData();
    files.forEach(({ file }) => formData.append('files', file));
    formData.append('documentType', docType);
    if (entityId) formData.append('entityId', entityId);

    setProgress(0);

    try {
      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6000/api/v1'}/documents/upload`);

        // Attach auth token if available
        const token = (apiClient as unknown as { _token?: string })._token;
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(xhr.statusText));
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });

      toast.success('Documents uploaded successfully!');
      setFiles([]);
      setProgress(null);
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('Upload failed. Please try again.');
      setProgress(null);
    }
  };

  const handleClose = () => {
    if (progress !== null) return; // block close during upload
    setFiles([]);
    setProgress(null);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background border border-border shadow-xl p-6 focus:outline-none"
          aria-describedby="upload-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">Upload Documents</Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <p id="upload-desc" className="text-sm text-muted-foreground mb-4">
            Drag and drop files below or click to browse. Supported: PDF, images, Word docs.
          </p>

          {/* Document type selector */}
          <div className="mb-4 space-y-1.5">
            <Label htmlFor="docType">Document Type</Label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer py-10 transition-colors ${
              dragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
          >
            <Upload size={28} className={dragging ? 'text-primary' : 'text-muted-foreground'} />
            <p className="text-sm text-muted-foreground">
              {dragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <ul className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {files.map(({ file, id }) => (
                <li key={id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
                  <FileText size={16} className="text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Upload progress */}
          {progress !== null && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={progress !== null}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpload} disabled={files.length === 0 || progress !== null}>
              {progress !== null ? `Uploading ${progress}%…` : 'Upload'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
