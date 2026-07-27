'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  verified: boolean;
}

const DOC_TYPE_FILTERS = ['All', 'Bill of Lading', 'Invoice', 'Customs', 'Proof of Delivery', 'Other'] as const;

interface DocumentListProps {
  shipmentId: string;
}

export function DocumentList({ shipmentId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [shipmentId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/documents`);
      const data = await response.json();
      setDocuments(data);
    } catch {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Delete "${docName}"? This action cannot be undone.`)) return;

    setDeleting(docId);
    try {
      await fetch(`/api/shipments/${shipmentId}/documents/${docId}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success(`"${docName}" deleted.`);
    } catch {
      toast.error('Failed to delete document.');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = documents.filter((doc) => {
    if (activeFilter === 'All') return true;
    return doc.type === activeFilter;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {DOC_TYPE_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeFilter === filter
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {documents.length === 0
              ? 'No documents uploaded yet. Use the upload button to add documents.'
              : 'No documents match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent/50 transition-colors"
            >
              {/* Icon */}
              <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  {doc.verified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-medium">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{doc.type}</span>
                  <span>{doc.uploadedBy}</span>
                  <span>·</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={`View ${doc.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </a>
                <a
                  href={`${doc.url}/download`}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={`Download ${doc.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  disabled={deleting === doc.id}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors disabled:opacity-50"
                  aria-label={`Delete ${doc.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
