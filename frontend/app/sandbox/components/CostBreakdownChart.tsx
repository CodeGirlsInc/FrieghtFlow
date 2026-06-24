'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface CostItem {
  label: string;
  amount: number;
}

interface CostBreakdownChartProps {
  breakdown: CostItem[];
  currency?: string;
}

const SLICE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#f43f5e', '#14b8a6', '#f97316'];

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  payload: { pct: number };
}

function CustomTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: item } = payload[0];
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-900">{name}</p>
      <p className="text-xs text-gray-600">{formatCurrency(value, currency)}</p>
      <p className="text-xs text-gray-400">{item.pct.toFixed(1)}%</p>
    </div>
  );
}

export function CostBreakdownChart({ breakdown, currency = 'USD' }: CostBreakdownChartProps) {
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  const data = breakdown.map((item) => ({
    name: item.label,
    value: item.amount,
    pct: (item.amount / total) * 100,
  }));

  return (
    <div className="space-y-5">
      {/* Donut */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={100}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">Total</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(total, currency)}</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {data.map((item, i) => (
          <li key={item.name} className="flex items-center gap-3 px-4 py-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }}
            />
            <span className="flex-1 text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(item.value, currency)}
            </span>
            <span className="w-12 text-right text-xs text-gray-400">
              {item.pct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
