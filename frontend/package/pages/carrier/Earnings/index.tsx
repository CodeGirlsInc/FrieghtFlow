'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface EarningRecord {
  id: string;
  shipmentRef: string;
  date: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
}

interface EarningsByMonth {
  month: string;
  earnings: number;
}

interface CarrierEarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  earningsByMonth: EarningsByMonth[];
  records: EarningRecord[];
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

const STATUS_LABELS: Record<EarningRecord['status'], string> = {
  pending: 'Pending',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

const STATUS_CLASSES: Record<EarningRecord['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

type SortKey = 'date' | 'amount' | 'status';
type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [10, 25, 50] as const;
const EMPTY_DATA: CarrierEarningsData = {
  totalEarnings: 0,
  pendingEarnings: 0,
  paidEarnings: 0,
  earningsByMonth: [],
  records: [],
};

interface CarrierEarningsDashboardProps {
  data?: CarrierEarningsData;
}

export function CarrierEarningsDashboard({
  data = EMPTY_DATA,
}: CarrierEarningsDashboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    return [...data.records].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === 'amount') {
        cmp = a.amount - b.amount;
      } else {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data.records, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = useCallback(() => {
    const header = 'Shipment Ref,Date,Amount,Currency,Status';
    const rows = sorted.map(
      (r) =>
        `${r.shipmentRef},${r.date},${r.amount.toFixed(2)},${r.currency},${r.status}`,
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Earnings"
          value={`$${data.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="All time"
        />
        <KpiCard
          title="Paid"
          value={`$${data.paidEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Successfully settled"
        />
        <KpiCard
          title="Pending"
          value={`$${data.pendingEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Awaiting payment"
        />
      </div>

      {/* Line Chart */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Monthly Earnings
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.earningsByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Earnings']} />
            <Legend />
            <Line
              type="monotone"
              dataKey="earnings"
              name="Earnings ($)"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Earnings Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Earnings History
          </h2>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Shipment Ref</th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium hover:text-gray-700"
                  onClick={() => handleSort('date')}
                >
                  Date{SortIcon({ col: 'date' })}
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium hover:text-gray-700"
                  onClick={() => handleSort('amount')}
                >
                  Amount{SortIcon({ col: 'amount' })}
                </th>
                <th
                  className="cursor-pointer px-6 py-3 font-medium hover:text-gray-700"
                  onClick={() => handleSort('status')}
                >
                  Status{SortIcon({ col: 'status' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No earnings records found.
                  </td>
                </tr>
              ) : (
                paginated.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">
                      {record.shipmentRef}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {record.currency} {record.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[record.status]}`}
                      >
                        {STATUS_LABELS[record.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                setPage(1);
              }}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">
              {sorted.length === 0
                ? '0 records'
                : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded border border-gray-300 px-2 py-1 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarrierEarningsDashboard;
