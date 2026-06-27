// #999 – Admin platform stats overview component
'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api/client';

interface Stats { totalUsers: number; activeShipments: number; totalRevenue: number; openDisputes: number; }

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-blue-700">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

export function PlatformStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { apiClient<Stats>('/admin/stats').then(setStats).catch(console.error); }, []);
  if (!stats) return <div className="text-sm text-gray-400">Loading stats…</div>;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Total Users" value={stats.totalUsers} />
      <StatCard label="Active Shipments" value={stats.activeShipments} />
      <StatCard label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} />
      <StatCard label="Open Disputes" value={stats.openDisputes} />
    </div>
  );
}
