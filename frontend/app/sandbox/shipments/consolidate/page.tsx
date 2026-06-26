'use client';

import { useState, useMemo } from 'react';

type CargoCategory = 'General' | 'Refrigerated' | 'Hazmat' | 'Oversized';

interface Shipment {
  id: string;
  description: string;
  origin: string;
  destination: string;
  region: string;
  weightKg: number;
  volumeM3: number;
  costUsd: number;
  cargoType: CargoCategory;
}

const MOCK_SHIPMENTS: Shipment[] = [
  { id: 'FF-101', description: 'Office supplies',    origin: 'Lagos',    destination: 'Abuja',  region: 'North-Central', weightKg: 12, volumeM3: 0.5, costUsd: 120, cargoType: 'General' },
  { id: 'FF-102', description: 'Clothing bales',     origin: 'Kano',     destination: 'Abuja',  region: 'North-Central', weightKg: 40, volumeM3: 1.2, costUsd: 200, cargoType: 'General' },
  { id: 'FF-103', description: 'Fresh produce',      origin: 'Ibadan',   destination: 'Abuja',  region: 'North-Central', weightKg: 25, volumeM3: 0.8, costUsd: 180, cargoType: 'Refrigerated' },
  { id: 'FF-104', description: 'Electronics',        origin: 'Aba',      destination: 'Abuja',  region: 'North-Central', weightKg: 18, volumeM3: 0.6, costUsd: 155, cargoType: 'General' },
  { id: 'FF-105', description: 'Furniture',          origin: 'Enugu',    destination: 'Abuja',  region: 'North-Central', weightKg: 80, volumeM3: 3.0, costUsd: 310, cargoType: 'Oversized' },
  { id: 'FF-106', description: 'Chemical drums',     origin: 'Lagos',    destination: 'Kano',   region: 'North-West',    weightKg: 60, volumeM3: 1.5, costUsd: 280, cargoType: 'Hazmat' },
  { id: 'FF-107', description: 'Books & stationery', origin: 'Calabar',  destination: 'Kano',   region: 'North-West',    weightKg: 22, volumeM3: 0.7, costUsd: 140, cargoType: 'General' },
  { id: 'FF-108', description: 'Spare parts',        origin: 'Warri',    destination: 'Kano',   region: 'North-West',    weightKg: 35, volumeM3: 1.0, costUsd: 170, cargoType: 'General' },
  { id: 'FF-109', description: 'Vaccine batch',      origin: 'Lagos',    destination: 'Kano',   region: 'North-West',    weightKg: 8,  volumeM3: 0.3, costUsd: 220, cargoType: 'Refrigerated' },
  { id: 'FF-110', description: 'Packaging material', origin: 'Kaduna',   destination: 'Kano',   region: 'North-West',    weightKg: 15, volumeM3: 0.9, costUsd: 100, cargoType: 'General' },
  { id: 'FF-111', description: 'Dry goods',          origin: 'Maiduguri',destination: 'Lagos',  region: 'South-West',    weightKg: 50, volumeM3: 2.0, costUsd: 260, cargoType: 'General' },
  { id: 'FF-112', description: 'Auto parts',         origin: 'Jos',      destination: 'Lagos',  region: 'South-West',    weightKg: 44, volumeM3: 1.4, costUsd: 230, cargoType: 'General' },
];

const CONSOLIDATION_RATE = 0.25; // 25% savings on consolidated

const INCOMPATIBLE: Partial<Record<CargoCategory, CargoCategory[]>> = {
  Hazmat: ['General', 'Refrigerated', 'Oversized'],
  General: ['Hazmat'],
  Refrigerated: ['Hazmat'],
  Oversized: ['Hazmat'],
};

function isIncompatible(selected: Shipment[]): boolean {
  const types = [...new Set(selected.map((s) => s.cargoType))];
  for (const t of types) {
    const blocked = INCOMPATIBLE[t] ?? [];
    if (types.some((other) => other !== t && blocked.includes(other))) return true;
  }
  return false;
}

const MAX = 10;
const REGIONS = [...new Set(MOCK_SHIPMENTS.map((s) => s.region))];

export default function ConsolidatePage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [confirmed, setConfirmed] = useState(false);

  const filtered = useMemo(
    () => filterRegion === 'all' ? MOCK_SHIPMENTS : MOCK_SHIPMENTS.filter((s) => s.region === filterRegion),
    [filterRegion],
  );

  const selected = useMemo(
    () => MOCK_SHIPMENTS.filter((s) => selectedIds.has(s.id)),
    [selectedIds],
  );

  const totalWeight = selected.reduce((s, x) => s + x.weightKg, 0);
  const totalVolume = selected.reduce((s, x) => s + x.volumeM3, 0);
  const totalCost = selected.reduce((s, x) => s + x.costUsd, 0);
  const estimatedSavings = Math.round(totalCost * CONSOLIDATION_RATE);
  const incompatible = isIncompatible(selected);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < MAX) { next.add(id); }
      return next;
    });
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-xl border border-green-200 bg-green-50 p-10 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-4 text-xl font-bold text-green-800">Consolidation Confirmed!</h2>
          <p className="mt-2 text-sm text-green-700">
            {selected.length} shipments consolidated · {totalWeight} kg · {totalVolume.toFixed(1)} m³
          </p>
          <p className="mt-1 text-lg font-semibold text-green-800">You save ${estimatedSavings}</p>
          <button onClick={() => { setSelectedIds(new Set()); setConfirmed(false); }}
            className="mt-6 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700">
            Start Over
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Shipment Consolidation Planner</h1>
        <p className="mb-6 text-sm text-gray-500">
          Select up to {MAX} shipments going to the same region to combine into one booking.
        </p>

        {/* Region filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium text-gray-500 uppercase">Region:</span>
          {['all', ...REGIONS].map((r) => (
            <button key={r} onClick={() => setFilterRegion(r)}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                filterRegion === r
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100',
              ].join(' ')}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Shipment list */}
          <div className="md:col-span-2 space-y-2">
            {selectedIds.size >= MAX && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
                ⚠️ Maximum {MAX} shipments per consolidation reached.
              </div>
            )}
            {filtered.map((s) => {
              const checked = selectedIds.has(s.id);
              return (
                <label key={s.id}
                  className={[
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all',
                    checked
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300',
                  ].join(' ')}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s.id)}
                    className="mt-0.5 h-4 w-4 accent-blue-600"
                    aria-label={`Select shipment ${s.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">{s.id}</span>
                      <span className={[
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        s.cargoType === 'Hazmat' ? 'bg-red-100 text-red-700' :
                        s.cargoType === 'Refrigerated' ? 'bg-cyan-100 text-cyan-700' :
                        s.cargoType === 'Oversized' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600',
                      ].join(' ')}>{s.cargoType}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                    <p className="text-xs text-gray-400">{s.origin} → {s.destination} · {s.region}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.weightKg} kg · {s.volumeM3} m³ · <span className="font-medium">${s.costUsd}</span></p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Summary panel */}
          <div className="space-y-4">
            <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-800">Consolidation Summary</h2>
              {selected.length === 0 ? (
                <p className="text-xs text-gray-400">No shipments selected yet.</p>
              ) : (
                <>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Shipments</dt><dd className="font-semibold">{selected.length}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Total Weight</dt><dd className="font-semibold">{totalWeight} kg</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Total Volume</dt><dd className="font-semibold">{totalVolume.toFixed(1)} m³</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500">Combined Cost</dt><dd className="font-semibold">${totalCost}</dd></div>
                    <div className="flex justify-between text-green-700"><dt>Est. Savings (25%)</dt><dd className="font-bold">-${estimatedSavings}</dd></div>
                    <div className="flex justify-between border-t pt-2"><dt className="font-semibold text-gray-800">You Pay</dt><dd className="font-bold text-blue-700">${totalCost - estimatedSavings}</dd></div>
                  </dl>

                  {incompatible && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      ⛔ Incompatible cargo types selected. Hazmat cannot be mixed with other types.
                    </div>
                  )}

                  <button
                    onClick={() => setConfirmed(true)}
                    disabled={incompatible || selected.length < 2}
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Confirm Consolidation
                  </button>
                  {selected.length < 2 && (
                    <p className="mt-1 text-center text-xs text-gray-400">Select at least 2 shipments</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
