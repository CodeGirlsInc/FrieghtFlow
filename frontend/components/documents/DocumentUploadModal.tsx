'use client';

import { useCallback, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { documentsApi, DocumentType } from '../../lib/api/documents.api';
import { partitionValidFiles } from '../../lib/validation/file-upload';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.BILL_OF_LADING]: 'Bill of Lading',
  [DocumentType.PROOF_OF_DELIVERY]: 'Proof of Delivery',
  [DocumentType.INVOICE]: 'Invoice',
  [DocumentType.CUSTOMS_DECLARATION]: 'Customs Declaration',
  [DocumentType.INSURANCE_CERTIFICATE]: 'Insurance Certificate',
  [DocumentType.PHOTO]: 'Photo',
  [DocumentType.OTHER]: 'Other',
};

interface SelectedFile {
  file: File;
  id: string;
}

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shipment this document belongs to — required by the backend. */
  shipmentId: string;
  onSuccess?: () => void;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  shipmentId,
  onSuccess,
}: DocumentUploadModalProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.OTHER);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const { valid, errors } = partitionValidFiles(incoming);
    errors.forEach((message) => toast.error(message));
    if (valid.length === 0) return;
    const next: SelectedFile[] = valid.map((file) => ({
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

    setProgress(0);

    try {
      // The backend accepts one file per request, so upload sequentially
      // and report overall progress across the whole batch.
      for (let i = 0; i < files.length; i++) {
        await documentsApi.upload(
          files[i].file,
          { shipmentId, documentType: docType },
          (filePercent) => {
            const overall = ((i + filePercent / 100) / files.length) * 100;
            setProgress(Math.round(overall));
          },
        );
      }

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
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.values(DocumentType).map((t) => (
                <option key={t} value={t}>
                  {DOCUMENT_TYPE_LABELS[t]}
                </option>
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
