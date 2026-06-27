'use client';
// #995 – Payment flow: history, invoice download & earnings
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api/client';

interface Payment { id: string; shipmentId: string; amount: number; status: string; invoicePdfUrl?: string; }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Payment[]>('/payments').then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      {payments.length === 0 ? <p className="text-gray-400">No payment records yet.</p> : (
        <ul className="divide-y rounded border">
          {payments.map(p => (
            <li key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">Shipment {p.shipmentId}</p>
                <p className="text-xs text-gray-500">${(p.amount / 100).toFixed(2)} · {p.status}</p>
              </div>
              {p.invoicePdfUrl && <a href={p.invoicePdfUrl} className="text-sm text-blue-600 underline">Download Invoice</a>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
