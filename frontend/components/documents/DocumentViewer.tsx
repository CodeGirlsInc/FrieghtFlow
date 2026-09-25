'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { documentsApi } from '../../lib/api/documents.api';
import { getAccessToken } from '../../lib/api/client';

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  /** Document ID — the download URL is resolved via documentsApi (FE-107). */
  documentId: string;
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

export function DocumentViewer({
  open,
  onClose,
  documentId,
  fileName,
  mimeType,
}: DocumentViewerProps) {
  const url = documentsApi.getDownloadUrl(documentId);
  const fileType = getFileType(url, mimeType);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

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

  // Fetch the file as an authenticated blob rather than pointing <img>/
  // <iframe>/<a> at `url` directly — those tags can't attach the
  // Authorization header the rest of the app sends via apiClient, so a
  // backend that enforces Bearer-token auth on this route (rather than
  // accepting a session cookie) would 401 on every preview/download.
  useEffect(() => {
    if (!open) {
      setBlobUrl(null);
      setLoadError(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    setLoadError(false);
    const token = getAccessToken();
    fetch(url, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document');
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, url, documentId]);

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
              <a
                href={blobUrl ?? undefined}
                download={fileName}
                aria-label="Download file"
                aria-disabled={!blobUrl}
                onClick={(e) => {
                  if (!blobUrl) e.preventDefault();
                }}
              >
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
          {loadError && (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-destructive">
              <p>Failed to load {fileName}.</p>
            </div>
          )}
          {!loadError && !blobUrl && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading document" />
          )}
          {!loadError && blobUrl && fileType === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blobUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain p-4"
            />
          )}
          {!loadError && blobUrl && fileType === 'pdf' && (
            <iframe
              src={blobUrl}
              title={fileName}
              className="w-full h-full min-h-[60vh]"
              aria-label={`PDF viewer for ${fileName}`}
            />
          )}
          {!loadError && blobUrl && fileType === 'other' && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Preview is not available for this file type.
              </p>
              <Button asChild>
                <a href={blobUrl} download={fileName}>
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
