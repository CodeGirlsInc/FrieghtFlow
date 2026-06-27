'use client';
// #989 – Advanced shipment filters: multi-status, date range, sort & CSV export
import { useState } from 'react';

export interface ShipmentFilters { status: string[]; from?: string; to?: string; sortBy: string; }
interface Props { onFilter: (f: ShipmentFilters) => void; onExport: () => void; }

const STATUSES = ['pending','accepted','in_transit','delivered','completed','cancelled'];

export function ShipmentFilters({ onFilter, onExport }: Props) {
  const [status, setStatus] = useState<string[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const toggle = (s: string) => setStatus(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <div className="space-y-3 rounded border p-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s} type="button" onClick={() => toggle(s)}
            className={`rounded px-2 py-1 text-xs font-medium ${status.includes(s) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded border px-2 py-1 text-sm"/>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded border px-2 py-1 text-sm"/>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded border px-2 py-1 text-sm">
          <option value="createdAt">Date</option><option value="amount">Amount</option><option value="status">Status</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onFilter({ status, from: from||undefined, to: to||undefined, sortBy })} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Apply</button>
        <button onClick={onExport} className="rounded border px-3 py-1 text-sm text-gray-600">Export CSV</button>
      </div>
    </div>
  );
}
