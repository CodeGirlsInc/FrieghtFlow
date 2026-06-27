'use client';
// #993 – Dashboard home: KPI cards & activity feed
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api/client';

interface Summary { totalShipments: number; activeShipments: number; totalSpend: number; onTimeRate: number; openDisputes: number; }

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    apiClient<Summary>('/dashboard/summary').then(setSummary).catch(console.error);
  }, []);

  if (!summary) return <div className="p-6 text-sm text-gray-400">Loading dashboard…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total Shipments" value={summary.totalShipments} />
        <KpiCard label="Active" value={summary.activeShipments} />
        <KpiCard label="On-Time Rate" value={`${summary.onTimeRate}%`} />
        <KpiCard label="Open Disputes" value={summary.openDisputes} />
      </div>
    </div>
  );
}
