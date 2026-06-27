'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = {
  totalEarned: 48_320.5,
  thisMonth: 6_140.0,
  pendingPayout: 1_850.0,
  completedDeliveries: 312,
};

const WEEKLY_EARNINGS = [
  { week: 'May 5',  amount: 5200 },
  { week: 'May 12', amount: 4800 },
  { week: 'May 19', amount: 6100 },
  { week: 'May 26', amount: 5500 },
  { week: 'Jun 2',  amount: 7200 },
  { week: 'Jun 9',  amount: 6400 },
  { week: 'Jun 16', amount: 5900 },
  { week: 'Jun 23', amount: 6140 },
];

const PAYOUT_HISTORY = [
  { date: 'Jun 15, 2026', amount: 4200.0,  status: 'paid',    ref: 'TXN-9981' },
  { date: 'Jun 1, 2026',  amount: 5100.5,  status: 'paid',    ref: 'TXN-9762' },
  { date: 'May 15, 2026', amount: 4850.0,  status: 'paid',    ref: 'TXN-9541' },
  { date: 'May 1, 2026',  amount: 4600.0,  status: 'paid',    ref: 'TXN-9310' },
  { date: 'Jun 26, 2026', amount: 1850.0,  status: 'pending', ref: 'TXN-PEND' },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 ${className ?? ''}`}
    />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-32" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CarrierEarningsPage() {
  const [loading] = useState(false);
  const hasPending = STATS.pendingPayout > 0;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h1>
            <p className="text-sm text-gray-500">Your earnings overview and payout history</p>
          </div>
          <button
            disabled={hasPending || loading}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Request Payout
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Earned (All Time)" value={fmt(STATS.totalEarned)} loading={loading} />
          <StatCard label="This Month"               value={fmt(STATS.thisMonth)}   loading={loading} />
          <StatCard label="Pending Payout"            value={fmt(STATS.pendingPayout)} loading={loading} />
          <StatCard label="Completed Deliveries"      value={String(STATS.completedDeliveries)} loading={loading} />
        </div>

        {/* Weekly earnings bar chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Earnings — Last 8 Weeks
          </h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_EARNINGS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(v: number) => [fmt(v), 'Earnings']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payout history table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Payout History
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PAYOUT_HISTORY.map((row) => (
                  <tr key={row.ref} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700">{row.date}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{fmt(row.amount)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          row.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
