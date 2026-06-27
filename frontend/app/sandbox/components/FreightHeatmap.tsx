'use client';

import { useState } from 'react';

export type HeatmapMetric = 'volume' | 'cost' | 'ontime';

export interface RegionData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  volume: number;  // shipment count
  cost: number;    // avg cost USD
  ontime: number;  // on-time rate %
}

interface FreightHeatmapProps {
  data: RegionData[];
}

const METRIC_LABELS: Record<HeatmapMetric, string> = {
  volume: 'Shipment Volume',
  cost: 'Average Cost',
  ontime: 'On-Time Rate',
};

function getMetricValue(r: RegionData, metric: HeatmapMetric): number {
  return metric === 'volume' ? r.volume : metric === 'cost' ? r.cost : r.ontime;
}

function formatMetric(value: number, metric: HeatmapMetric): string {
  if (metric === 'cost') return `$${value.toLocaleString()}`;
  if (metric === 'ontime') return `${value}%`;
  return value.toLocaleString();
}

/** Returns a blue shade 0–9 based on intensity 0-1 */
function colorShade(intensity: number): string {
  const blues = [
    '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd',
    '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    '#1e40af', '#1e3a8a',
  ];
  const idx = Math.min(Math.floor(intensity * 10), 9);
  return blues[idx];
}

interface TooltipState {
  region: RegionData;
  x: number;
  y: number;
}

export function FreightHeatmap({ data }: FreightHeatmapProps) {
  const [metric, setMetric] = useState<HeatmapMetric>('volume');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const values = data.map((r) => getMetricValue(r, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const sorted = [...data].sort(
    (a, b) => getMetricValue(b, metric) - getMetricValue(a, metric),
  );

  return (
    <div className="space-y-4">
      {/* metric toggle */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(METRIC_LABELS) as [HeatmapMetric, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              metric === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* grid */}
      <div
        className="relative grid gap-1.5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {sorted.map((region) => {
          const val = getMetricValue(region, metric);
          const intensity = (val - min) / range;
          const bg = colorShade(intensity);
          return (
            <div
              key={region.code}
              className="flex h-14 cursor-default flex-col items-center justify-center rounded-lg text-xs font-semibold transition-transform hover:scale-105"
              style={{ backgroundColor: bg, color: intensity > 0.5 ? '#fff' : '#1e3a8a' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ region, x: rect.left, y: rect.top });
              }}
            >
              <span>{region.code}</span>
              <span className="text-[10px] font-normal opacity-80">{formatMetric(val, metric)}</span>
            </div>
          );
        })}
      </div>

      {/* floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xl text-sm pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 90 }}
        >
          <p className="font-semibold text-gray-900">{tooltip.region.name}</p>
          <p className="text-gray-600">Volume: {tooltip.region.volume.toLocaleString()}</p>
          <p className="text-gray-600">Avg Cost: ${tooltip.region.cost.toLocaleString()}</p>
          <p className="text-gray-600">On-Time: {tooltip.region.ontime}%</p>
        </div>
      )}

      {/* legend */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Low</span>
        <div
          className="h-3 flex-1 rounded-full"
          style={{
            background: 'linear-gradient(to right, #eff6ff, #3b82f6, #1e3a8a)',
          }}
        />
        <span className="text-xs text-gray-500">High</span>
      </div>
      <p className="text-center text-xs text-gray-400">{METRIC_LABELS[metric]}</p>
    </div>
  );
}
