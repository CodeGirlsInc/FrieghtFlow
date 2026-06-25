'use client';

import { useEffect, useState, useCallback } from 'react';
import { documentApi, Document, DocumentListParams } from '../../../lib/api/document.api';
import Link from 'next/link';

const DOC_TYPES = ['All', 'Bill of Lading', 'Proof of Delivery', 'Invoice', 'Customs', 'Insurance', 'Photo', 'Other'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function IpfsBadge({ status }: { status: Document['ipfsStatus'] }) {
  if (status === 'pinned') return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Pinned</span>;
  if (status === 'pending') return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Pending</span>;
  return <span className="text-muted-foreground text-xs">—</span>;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: DocumentListParams = { page, limit };
      if (docType !== 'All') params.documentType = docType;
      if (search) params.trackingNumber = search;
      const res = await documentApi.list(params);
      setDocs(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, docType, search]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    await documentApi.delete(id);
    setDeleteId(null);
    load();
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Documents</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={docType}
          onChange={(e) => { setDocType(e.target.value); setPage(1); }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search by tracking number…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border bg-background px-3 py-2 text-sm w-64"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <p className="text-muted-foreground text-lg">No documents yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  {['File Name', 'Type', 'Shipment', 'Uploaded', 'Size', 'IPFS', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={'/documents/' + doc.id} className="hover:underline">{doc.fileName}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">{doc.documentType}</span>
                    </td>
                    <td className="px-4 py-3">
                      {doc.shipmentId ? (
                        <Link href={'/shipments/' + doc.shipmentId} className="text-primary hover:underline text-xs">
                          {doc.shipmentTrackingNumber}
                        </Link>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBytes(doc.fileSize)}</td>
                    <td className="px-4 py-3"><IpfsBadge status={doc.ipfsStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => documentApi.download(doc.id, doc.fileName)}
                          className="text-xs text-primary hover:underline"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => setDeleteId(doc.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {from}–{to} of {total} documents</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded border disabled:opacity-40">Previous</button>
              <button disabled={to >= total} onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded border disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 space-y-4 w-80 shadow-xl">
            <p className="font-semibold">Delete document?</p>
            <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded border">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm rounded bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
