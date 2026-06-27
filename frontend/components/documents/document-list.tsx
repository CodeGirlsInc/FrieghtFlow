'use client';
// #1006 – Document Management UI: list, preview and delete shipment documents
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api/client';

interface Doc { id: string; fileName: string; fileUrl: string; shipmentId: string; }

export function DocumentList({ shipmentId }: { shipmentId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Doc[]>(`/documents?shipmentId=${shipmentId}`)
      .then(setDocs).catch(console.error).finally(() => setLoading(false));
  }, [shipmentId]);

  const remove = async (id: string) => {
    await apiClient(`/documents/${id}`, { method: 'DELETE' });
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (!docs.length) return <p className="text-sm text-gray-400">No documents uploaded.</p>;

  return (
    <ul className="divide-y rounded border">
      {docs.map(d => (
        <li key={d.id} className="flex items-center justify-between p-3">
          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">{d.fileName}</a>
          <button onClick={() => remove(d.id)} className="text-xs text-red-500 hover:underline">Delete</button>
        </li>
      ))}
    </ul>
  );
}
