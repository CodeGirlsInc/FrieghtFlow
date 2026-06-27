'use client';

import { FreightHeatmap, type RegionData } from '../components/FreightHeatmap';

const MOCK_DATA: RegionData[] = [
  { code: 'US', name: 'United States',    volume: 4820, cost: 1240, ontime: 97 },
  { code: 'CN', name: 'China',            volume: 4100, cost: 980,  ontime: 88 },
  { code: 'DE', name: 'Germany',          volume: 2900, cost: 1100, ontime: 94 },
  { code: 'GB', name: 'United Kingdom',   volume: 2400, cost: 1050, ontime: 92 },
  { code: 'NG', name: 'Nigeria',          volume: 1850, cost: 620,  ontime: 82 },
  { code: 'IN', name: 'India',            volume: 1700, cost: 540,  ontime: 85 },
  { code: 'BR', name: 'Brazil',           volume: 1450, cost: 790,  ontime: 80 },
  { code: 'JP', name: 'Japan',            volume: 1300, cost: 1380, ontime: 96 },
  { code: 'FR', name: 'France',           volume: 1200, cost: 1020, ontime: 93 },
  { code: 'ZA', name: 'South Africa',     volume: 980,  cost: 710,  ontime: 79 },
  { code: 'AU', name: 'Australia',        volume: 870,  cost: 1560, ontime: 91 },
  { code: 'MX', name: 'Mexico',           volume: 760,  cost: 680,  ontime: 78 },
  { code: 'CA', name: 'Canada',           volume: 700,  cost: 1190, ontime: 95 },
  { code: 'KR', name: 'South Korea',      volume: 620,  cost: 1100, ontime: 94 },
  { code: 'SG', name: 'Singapore',        volume: 580,  cost: 1440, ontime: 98 },
  { code: 'AE', name: 'UAE',              volume: 540,  cost: 1320, ontime: 90 },
  { code: 'EG', name: 'Egypt',            volume: 420,  cost: 580,  ontime: 76 },
  { code: 'GH', name: 'Ghana',            volume: 310,  cost: 640,  ontime: 74 },
  { code: 'IT', name: 'Italy',            volume: 290,  cost: 980,  ontime: 89 },
  { code: 'AR', name: 'Argentina',        volume: 240,  cost: 730,  ontime: 77 },
];

export default function AnalyticsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Freight Analytics Heatmap</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hover over a region for details. Toggle metrics to compare volume, cost, and on-time rate.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <FreightHeatmap data={MOCK_DATA} />
      </div>
    </main>
  );
}
