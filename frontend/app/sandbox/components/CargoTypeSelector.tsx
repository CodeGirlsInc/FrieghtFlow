'use client';

import { useState } from 'react';

export type CargoType =
  | 'general'
  | 'refrigerated'
  | 'hazardous'
  | 'oversized'
  | 'liquid_bulk'
  | 'dry_bulk'
  | 'vehicles';

interface CargoTypeDef {
  type: CargoType;
  icon: string;
  label: string;
  description: string;
  color: string;
}

const CARGO_TYPES: CargoTypeDef[] = [
  { type: 'general',     icon: '📦', label: 'General Cargo',          description: 'Standard packaged goods',            color: 'border-blue-400 bg-blue-50' },
  { type: 'refrigerated',icon: '❄️', label: 'Refrigerated',           description: 'Temperature-controlled freight',     color: 'border-cyan-400 bg-cyan-50' },
  { type: 'hazardous',   icon: '⚠️', label: 'Hazardous Materials',    description: 'Regulated dangerous goods',          color: 'border-red-400 bg-red-50' },
  { type: 'oversized',   icon: '🏗️', label: 'Oversized / Heavy Lift', description: 'Out-of-gauge or heavy loads',        color: 'border-orange-400 bg-orange-50' },
  { type: 'liquid_bulk', icon: '🛢️', label: 'Liquid Bulk',            description: 'Liquids transported in bulk',        color: 'border-indigo-400 bg-indigo-50' },
  { type: 'dry_bulk',    icon: '🌾', label: 'Dry Bulk',               description: 'Grains, coal, ore, or powder',       color: 'border-yellow-400 bg-yellow-50' },
  { type: 'vehicles',    icon: '🚗', label: 'Vehicles',               description: 'Cars, trucks, or heavy machinery',   color: 'border-green-400 bg-green-50' },
];

interface CargoTypeSelectorProps {
  onSelect?: (type: CargoType) => void;
  defaultValue?: CargoType;
}

export function CargoTypeSelector({ onSelect, defaultValue }: CargoTypeSelectorProps) {
  const [selected, setSelected] = useState<CargoType | null>(defaultValue ?? null);
  const [unNumber, setUnNumber] = useState('');

  function handleSelect(type: CargoType) {
    setSelected(type);
    onSelect?.(type);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {CARGO_TYPES.map(({ type, icon, label, description, color }) => {
          const isSelected = selected === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSelect(type)}
              className={[
                'flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center transition-all',
                isSelected
                  ? `${color} border-opacity-100 shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <span className="text-3xl" role="img" aria-label={label}>{icon}</span>
              <span className="text-sm font-semibold text-gray-900">{label}</span>
              <span className="text-xs text-gray-500">{description}</span>
            </button>
          );
        })}
      </div>

      {selected === 'hazardous' && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="un-number">
            UN Number <span className="text-red-500">*</span>
          </label>
          <input
            id="un-number"
            type="text"
            value={unNumber}
            onChange={(e) => setUnNumber(e.target.value)}
            placeholder="e.g. UN1234"
            maxLength={8}
            className="mt-1 block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          <p className="mt-1 text-xs text-gray-500">Required for hazardous materials shipments.</p>
        </div>
      )}
    </div>
  );
}
