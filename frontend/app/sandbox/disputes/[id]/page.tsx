'use client';

import { useState } from 'react';
import { EvidenceUpload } from '../../components/EvidenceUpload';

export default function DisputeEvidencePage({ params }: { params: { id: string } }) {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Dispute #{params.id}</h1>
        <p className="mb-6 text-sm text-gray-500">
          Upload evidence to support your case. Accepted: PDF, PNG, JPEG, MP4 (max 50 MB / file, up to 10 files).
        </p>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <EvidenceUpload onUploadComplete={setUrls} />
        </div>

        {urls.length > 0 && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Uploaded file URLs ({urls.length})
            </p>
            <ul className="mt-2 space-y-1">
              {urls.map((url) => (
                <li key={url} className="truncate font-mono text-xs text-green-800">{url}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
