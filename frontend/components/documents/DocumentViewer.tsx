'use client';

import { useEffect, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  url: string;
  fileName: string;
  mimeType?: string;
}

function getFileType(url: string, mimeType?: string): 'image' | 'pdf' | 'other' {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
  }
  const lower = url.toLowerCase().split('?')[0];
  if (/\.(png|jpe?g|gif|webp|svg|bmp)$/.test(lower)) return 'image';
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'other';
}

export function DocumentViewer({ open, onClose, url, fileName, mimeType }: DocumentViewerProps) {
  const fileType = getFileType(url, mimeType);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${fileName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col bg-background rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <span className="text-sm font-medium truncate max-w-[70%]">{fileName}</span>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={url} download={fileName} aria-label="Download file">
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
            <button
              onClick={onClose}
              aria-label="Close viewer"
              className="rounded-md p-1 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/30 min-h-0">
          {fileType === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={fileName}
              className="max-w-full max-h-full object-contain p-4"
            />
          )}
          {fileType === 'pdf' && (
            <iframe
              src={url}
              title={fileName}
              className="w-full h-full min-h-[60vh]"
              aria-label={`PDF viewer for ${fileName}`}
            />
          )}
          {fileType === 'other' && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Preview is not available for this file type.
              </p>
              <Button asChild>
                <a href={url} download={fileName}>
                  <Download className="h-4 w-4 mr-2" />
                  Download {fileName}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
