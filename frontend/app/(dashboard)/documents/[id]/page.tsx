'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { documentApi, Document } from '../../../../lib/api/document.api';
import Link from 'next/link';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function StatusBadge({ label, color }: { label: string; color: 'green' | 'yellow' | 'red' | 'gray' }) {
  const cls = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-muted text-muted-foreground',
  }[color];
  return <span className={'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' + cls}>{label}</span>;
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyResult, setVerifyResult] = useState<'verified' | 'mismatch' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    documentApi.getById(id).then(setDoc).finally(() => setLoading(false));
  }, [id]);

  async function handleVerify() {
    const fresh = await documentApi.getById(id);
    setVerifyResult(fresh.sha256Hash === doc?.sha256Hash ? 'verified' : 'mismatch');
  }

  async function handleDelete() {
    await documentApi.delete(id);
    router.push('/documents');
  }

  function copyHash() {
    if (doc?.sha256Hash) {
      navigator.clipboard.writeText(doc.sha256Hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}</div>;
  if (!doc) return <div className="p-6 text-muted-foreground">Document not found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
        <h1 className="text-xl font-bold flex-1 truncate">{doc.fileName}</h1>
        <button onClick={() => documentApi.download(doc.id, doc.fileName)} className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground">Download</button>
        <button onClick={() => setDeleteOpen(true)} className="px-4 py-2 text-sm rounded border text-destructive">Delete</button>
      </div>

      {/* Metadata */}
      <section className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Metadata</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">File name</dt><dd>{doc.fileName}</dd>
          <dt className="text-muted-foreground">Type</dt><dd>{doc.documentType}</dd>
          <dt className="text-muted-foreground">MIME type</dt><dd>{doc.mimeType}</dd>
          <dt className="text-muted-foreground">File size</dt><dd>{formatBytes(doc.fileSize)}</dd>
          <dt className="text-muted-foreground">Uploaded</dt><dd>{new Date(doc.uploadDate).toLocaleString()}</dd>
        </dl>
      </section>

      {/* Integrity */}
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Integrity</h2>
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">SHA-256 hash</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-2 py-1 text-xs font-mono break-all">{doc.sha256Hash ?? '—'}</code>
            {doc.sha256Hash && <button onClick={copyHash} className="text-xs text-primary shrink-0">{copied ? 'Copied!' : 'Copy'}</button>}
          </div>
        </div>
        {doc.ipfsCid && (
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">IPFS CID</p>
            <a href={'https://ipfs.io/ipfs/' + doc.ipfsCid} target="_blank" rel="noopener noreferrer"
              className="text-primary text-xs hover:underline break-all">{doc.ipfsCid}</a>
          </div>
        )}
        <div className="flex items-center gap-3">
          {doc.ipfsStatus && <StatusBadge label={doc.ipfsStatus === 'pinned' ? 'Pinned' : 'Pending'} color={doc.ipfsStatus === 'pinned' ? 'green' : 'yellow'} />}
          <button onClick={handleVerify} className="text-sm text-primary hover:underline">Verify Integrity</button>
          {verifyResult === 'verified' && <span className="text-green-600 text-sm font-medium">✓ Hash Verified</span>}
          {verifyResult === 'mismatch' && <span className="text-red-600 text-sm font-medium">✗ Hash Mismatch</span>}
        </div>
      </section>

      {/* Blockchain */}
      <section className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Blockchain</h2>
        {doc.stellarTxHash ? (
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">Stellar tx hash</p>
            <a href={'https://stellar.expert/explorer/testnet/tx/' + doc.stellarTxHash}
              target="_blank" rel="noopener noreferrer"
              className="text-primary text-xs hover:underline break-all">{doc.stellarTxHash}</a>
          </div>
        ) : <p className="text-sm text-muted-foreground">Not anchored yet.</p>}
        {doc.anchorStatus && (
          <StatusBadge
            label={doc.anchorStatus.charAt(0).toUpperCase() + doc.anchorStatus.slice(1)}
            color={doc.anchorStatus === 'anchored' ? 'green' : doc.anchorStatus === 'failed' ? 'red' : 'yellow'}
          />
        )}
      </section>

      {/* Linked shipment */}
      <section className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Linked Shipment</h2>
        {doc.shipmentId ? (
          <Link href={'/shipments/' + doc.shipmentId} className="text-primary text-sm hover:underline">
            {doc.shipmentTrackingNumber}
          </Link>
        ) : <p className="text-sm text-muted-foreground">Not linked to a shipment.</p>}
      </section>

      {/* Delete dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 space-y-4 w-80 shadow-xl">
            <p className="font-semibold">Delete document?</p>
            <p className="text-sm text-muted-foreground">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm rounded border">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm rounded bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
