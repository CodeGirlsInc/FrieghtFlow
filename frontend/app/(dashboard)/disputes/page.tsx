'use client';
// #987 – Dispute flow: list disputes with status display
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api/client';

interface Dispute { id: string; shipmentId: string; status: string; reason: string; createdAt: string; }

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ data: Dispute[] }>('/disputes').then(r => setDisputes(r.data ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const color = (s: string) => s === 'open' ? 'text-red-600' : s === 'resolved' ? 'text-green-600' : 'text-yellow-600';

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading disputes…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Disputes</h1>
      {disputes.length === 0 ? <p className="text-gray-400">No disputes found.</p> : (
        <ul className="divide-y rounded border">
          {disputes.map(d => (
            <li key={d.id} className="p-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Shipment {d.shipmentId}</span>
                <span className={`text-xs font-semibold ${color(d.status)}`}>{d.status.toUpperCase()}</span>
              </div>
              <p className="text-xs text-gray-500">{d.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
