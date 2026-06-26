'use client';

import { useState, useMemo } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

type Status = 'delivered' | 'in_transit' | 'pending' | 'cancelled';

interface Shipment {
  id: string; origin: string; destination: string;
  date: string; status: Status; weight: string; cost: number;
}

const MOCK: Shipment[] = [
  { id: 'FF-001', origin: 'Lagos',     destination: 'Abuja',        date: '2026-04-01', status: 'delivered',  weight: '12kg', cost: 245 },
  { id: 'FF-002', origin: 'Kano',      destination: 'Port Harcourt',date: '2026-04-15', status: 'delivered',  weight: '8kg',  cost: 189 },
  { id: 'FF-003', origin: 'Ibadan',    destination: 'Enugu',        date: '2026-05-03', status: 'in_transit', weight: '20kg', cost: 310 },
  { id: 'FF-004', origin: 'Kaduna',    destination: 'Benin City',   date: '2026-05-10', status: 'pending',    weight: '5kg',  cost: 120 },
  { id: 'FF-005', origin: 'Aba',       destination: 'Jos',          date: '2026-05-20', status: 'cancelled',  weight: '15kg', cost: 275 },
  { id: 'FF-006', origin: 'Lagos',     destination: 'Calabar',      date: '2026-06-01', status: 'delivered',  weight: '9kg',  cost: 220 },
  { id: 'FF-007', origin: 'Zaria',     destination: 'Warri',        date: '2026-06-10', status: 'in_transit', weight: '30kg', cost: 450 },
  { id: 'FF-008', origin: 'Maiduguri', destination: 'Asaba',        date: '2026-06-15', status: 'pending',    weight: '7kg',  cost: 165 },
];

const ALL_STATUSES: Status[] = ['delivered', 'in_transit', 'pending', 'cancelled'];
const STATUS_LABEL: Record<Status, string> = { delivered: 'Delivered', in_transit: 'In Transit', pending: 'Pending', cancelled: 'Cancelled' };
const STATUS_CLS: Record<Status, string> = {
  delivered: 'bg-green-100 text-green-700', in_transit: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-red-100 text-red-700',
};
const PAGE_SIZE = 5;

export default function ShipmentExportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [statuses, setStatuses] = useState<Set<Status>>(new Set(ALL_STATUSES));
  const [page, setPage] = useState(1);
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const filtered = useMemo(() => MOCK.filter((s) => {
    if (from && s.date < from) return false;
    if (to && s.date > to) return false;
    return statuses.has(s.status);
  }), [from, to, statuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleStatus(s: Status) {
    setStatuses((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
    setPage(1);
  }

  function exportCSV() {
    setCsvLoading(true);
    setTimeout(() => {
      const header = 'ID,Origin,Destination,Date,Status,Weight,Cost (USD)';
      const lines = filtered.map((s) => `${s.id},${s.origin},${s.destination},${s.date},${s.status},${s.weight},${s.cost}`);
      const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'shipments.csv' });
      a.click(); URL.revokeObjectURL(a.href);
      setCsvLoading(false);
    }, 800);
  }

  function exportPDF() {
    setPdfLoading(true);
    setTimeout(() => setPdfLoading(false), 1200); // simulate API call
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Shipment History Export</h1>
        <p className="mb-8 text-sm text-gray-500">Filter shipments and export as CSV or PDF.</p>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[['From date', from, setFrom], ['To date', to, setTo]].map(([label, value, setter]) => (
              <div key={label as string}>
                <label className="mb-1 block text-xs font-medium text-gray-700">{label as string}</label>
                <input type="date" value={value as string}
                  onChange={(e) => { (setter as (v: string) => void)(e.target.value); setPage(1); }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700">Status</p>
            <div className="flex flex-wrap gap-3">
              {ALL_STATUSES.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700">
                  <input type="checkbox" checked={statuses.has(s)} onChange={() => toggleStatus(s)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                  {STATUS_LABEL[s]}
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filtered.length}</span> record{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex gap-2">
            <button onClick={exportCSV} disabled={csvLoading || !filtered.length}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {csvLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export CSV
            </button>
            <button onClick={exportPDF} disabled={pdfLoading || !filtered.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>{['ID','Origin','Destination','Date','Status','Weight','Cost'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No shipments match your filters.</td></tr>
              ) : rows.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{s.id}</td>
                  <td className="px-4 py-3 text-gray-700">{s.origin}</td>
                  <td className="px-4 py-3 text-gray-700">{s.destination}</td>
                  <td className="px-4 py-3 text-gray-500">{s.date}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.weight}</td>
                  <td className="px-4 py-3 text-gray-900">${s.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Previous</button>
            <span className="text-gray-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </main>
  );
}
