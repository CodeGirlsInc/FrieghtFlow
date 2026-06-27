'use client';

import { useState, useMemo } from 'react';

type TransportMode = 'Road' | 'Sea' | 'Air' | 'Rail';

// kg CO2 per tonne-km (standard emission factors)
const EMISSION_FACTORS: Record<TransportMode, number> = {
  Road: 0.096,
  Sea: 0.016,
  Air: 0.602,
  Rail: 0.028,
};

// One tree absorbs ~21 kg CO2/year
const KG_PER_TREE = 21;

const MODES: TransportMode[] = ['Road', 'Sea', 'Air', 'Rail'];

export function EmissionsCalculator() {
  const [mode, setMode] = useState<TransportMode>('Road');
  const [distance, setDistance] = useState<number>(500);
  const [weight, setWeight] = useState<number>(1000);

  const co2 = useMemo(() => {
    // CO2 (kg) = factor (kg/tonne-km) × distance (km) × weight (tonne)
    return EMISSION_FACTORS[mode] * distance * (weight / 1000);
  }, [mode, distance, weight]);

  const trees = Math.ceil(co2 / KG_PER_TREE);

  const { color, label } = co2 < 100
    ? { color: 'text-green-600', label: 'Low' }
    : co2 <= 500
      ? { color: 'text-yellow-600', label: 'Medium' }
      : { color: 'text-red-600', label: 'High' };

  const bgColor = co2 < 100 ? 'bg-green-50 border-green-200' : co2 <= 500 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-5">
      {/* Transport mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
        <div className="grid grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div>
        <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Distance</span>
          <span className="text-blue-600">{distance.toLocaleString()} km</span>
        </label>
        <input
          type="range"
          min={10}
          max={20000}
          step={10}
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>10 km</span><span>20,000 km</span>
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Cargo Weight</span>
          <span className="text-blue-600">{weight.toLocaleString()} kg</span>
        </label>
        <input
          type="range"
          min={1}
          max={50000}
          step={1}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>1 kg</span><span>50,000 kg</span>
        </div>
      </div>

      {/* Result */}
      <div className={`rounded-xl border p-5 ${bgColor}`}>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${color}`}>{co2.toFixed(1)}</span>
          <span className="text-sm font-medium text-gray-600">kg CO₂</span>
          <span className={`ml-auto rounded-full px-3 py-0.5 text-xs font-semibold ${color} bg-white border`}>
            {label}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          🌳 Equivalent to <strong>{trees.toLocaleString()} tree{trees !== 1 ? 's' : ''}</strong> needed to offset this shipment&apos;s emissions (1 year absorption).
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Factor: {EMISSION_FACTORS[mode]} kg CO₂/tonne-km ({mode})
        </p>
      </div>
    </div>
  );
}
