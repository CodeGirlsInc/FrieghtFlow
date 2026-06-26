'use client';

import { useState } from 'react';

type Tab = 'reputation' | 'ontime' | 'deliveries';
type CargoType = 'All' | 'General' | 'Hazmat' | 'Refrigerated' | 'Oversized';

interface Carrier {
  id: string;
  name: string;
  avatar: string;
  reputationScore: number;
  onTimeRate: number;
  totalDeliveries: number;
  cargoTypes: CargoType[];
}

const MOCK_CARRIERS: Carrier[] = [
  { id: 'c1', name: 'SwiftHaul Logistics',  avatar: 'SH', reputationScore: 98, onTimeRate: 97, totalDeliveries: 4820, cargoTypes: ['General', 'Refrigerated'] },
  { id: 'c2', name: 'Eagle Freight Co.',    avatar: 'EF', reputationScore: 95, onTimeRate: 93, totalDeliveries: 3910, cargoTypes: ['General', 'Hazmat'] },
  { id: 'c3', name: 'Horizon Shipping',     avatar: 'HS', reputationScore: 93, onTimeRate: 91, totalDeliveries: 3540, cargoTypes: ['General', 'Oversized'] },
  { id: 'c4', name: 'Meridian Cargo',       avatar: 'MC', reputationScore: 90, onTimeRate: 89, totalDeliveries: 2980, cargoTypes: ['General', 'Refrigerated', 'Hazmat'] },
  { id: 'c5', name: 'Atlas Express',        avatar: 'AE', reputationScore: 87, onTimeRate: 85, totalDeliveries: 2640, cargoTypes: ['General'] },
  { id: 'c6', name: 'PeakRoute Carriers',   avatar: 'PR', reputationScore: 84, onTimeRate: 83, totalDeliveries: 2200, cargoTypes: ['Hazmat', 'Oversized'] },
  { id: 'c7', name: 'Delta Transport',      avatar: 'DT', reputationScore: 81, onTimeRate: 80, totalDeliveries: 1980, cargoTypes: ['General', 'Refrigerated'] },
  { id: 'c8', name: 'Nimbus Freight',       avatar: 'NF', reputationScore: 78, onTimeRate: 76, totalDeliveries: 1650, cargoTypes: ['General'] },
];

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_BG = ['bg-yellow-50 border-yellow-300', 'bg-gray-50 border-gray-300', 'bg-orange-50 border-orange-300'];

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: 'reputation',  label: 'Reputation Score' },
  { key: 'ontime',      label: 'On-Time Rate' },
  { key: 'deliveries',  label: 'Total Deliveries' },
];

function metricValue(c: Carrier, tab: Tab): string {
  if (tab === 'reputation') return `${c.reputationScore}/100`;
  if (tab === 'ontime')     return `${c.onTimeRate}%`;
  return c.totalDeliveries.toLocaleString();
}

function sortByTab(carriers: Carrier[], tab: Tab): Carrier[] {
  return [...carriers].sort((a, b) =>
    tab === 'deliveries'
      ? b.totalDeliveries - a.totalDeliveries
      : tab === 'ontime'
      ? b.onTimeRate - a.onTimeRate
      : b.reputationScore - a.reputationScore
  );
}

export default function CarrierLeaderboardPage() {
  const [tab, setTab] = useState<Tab>('reputation');
  const [cargo, setCargo] = useState<CargoType>('All');
  const [loading] = useState(false);

  const filtered = MOCK_CARRIERS.filter(
    (c) => cargo === 'All' || c.cargoTypes.includes(cargo)
  );
  const sorted = sortByTab(filtered, tab);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Carrier Leaderboard</h1>
        <p className="mb-6 text-sm text-gray-500">Top-ranked carriers by performance metrics</p>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            {TAB_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value as CargoType)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {(['All', 'General', 'Hazmat', 'Refrigerated', 'Oversized'] as CargoType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {sorted.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">No carriers found for this filter.</p>
        )}

        {/* Top 3 */}
        <div className="mb-4 space-y-3">
          {top3.map((carrier, i) => (
            <div
              key={carrier.id}
              className={`flex items-center gap-4 rounded-lg border-2 p-4 ${MEDAL_BG[i]}`}
            >
              <span className="text-2xl">{MEDAL[i]}</span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {carrier.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{carrier.name}</p>
                <p className="text-xs text-gray-500">{carrier.cargoTypes.join(', ')}</p>
              </div>
              <span className="text-lg font-bold text-gray-800">{metricValue(carrier, tab)}</span>
            </div>
          ))}
        </div>

        {/* Remaining */}
        <ul className="space-y-2">
          {rest.map((carrier, i) => (
            <li
              key={carrier.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <span className="w-6 text-center text-sm font-semibold text-gray-400">#{i + 4}</span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                {carrier.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{carrier.name}</p>
                <p className="text-xs text-gray-400">{carrier.cargoTypes.join(', ')}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700">{metricValue(carrier, tab)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
