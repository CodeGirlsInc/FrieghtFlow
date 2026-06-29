'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

const ACCEPT = ['application/pdf', 'image/png', 'image/jpeg', 'video/mp4'];
const MAX_FILES = 10;
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

interface UploadedFile {
  id: string;
  file: File;
  progress: number; // 0-100
  url: string | null;
  previewUrl: string | null;
}

interface EvidenceUploadProps {
  onUploadComplete: (fileUrls: string[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EvidenceUpload({ onUploadComplete }: EvidenceUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (uploaded: UploadedFile) => {
    // Simulate incremental progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        const mockUrl = `https://cdn.example.com/evidence/${uploaded.id}`;
        setFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === uploaded.id ? { ...f, progress: 100, url: mockUrl } : f,
          );
          const done = updated.filter((f) => f.url).map((f) => f.url!);
          onUploadComplete(done);
          return updated;
        });
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === uploaded.id ? { ...f, progress } : f)),
        );
      }
    }, 200);
  };

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;

      const toAdd: UploadedFile[] = [];
      for (const file of Array.from(incoming)) {
        if (files.length + toAdd.length >= MAX_FILES) break;
        if (!ACCEPT.includes(file.type)) continue;
        if (file.size > MAX_BYTES) continue;

        const entry: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          progress: 0,
          url: null,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        };
        toAdd.push(entry);
      }

      setFiles((prev) => [...prev, ...toAdd]);
      toAdd.forEach(simulateUpload);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files.length],
  );

  const remove = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      const updated = prev.filter((x) => x.id !== id);
      onUploadComplete(updated.filter((x) => x.url).map((x) => x.url!));
      return updated;
    });
  };

  const fileIcon = (type: string) => {
    if (type === 'application/pdf') return '📄';
    if (type === 'video/mp4') return '🎬';
    return '📁';
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload evidence files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition focus:outline-none',
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-400',
        )}
      >
        <span className="text-3xl">☁️</span>
        <p className="mt-2 text-sm font-medium text-gray-700">
          Drag &amp; drop files here, or <span className="text-indigo-600 underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          PDF, PNG, JPEG, MP4 · Max 50 MB each · Up to {MAX_FILES} files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT.join(',')}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              {/* Thumbnail or icon */}
              {f.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.previewUrl}
                  alt={f.file.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <span className="text-2xl">{fileIcon(f.file.type)}</span>
              )}

              {/* Name + progress */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{f.file.name}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {f.progress < 100 ? `${Math.round(f.progress)}%` : '✓ Uploaded'}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => remove(f.id)}
                aria-label={`Remove ${f.file.name}`}
                className="ml-2 rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
