'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InsuranceTier = 'basic' | 'standard' | 'premium';

export interface InsuranceSelection {
  tier: InsuranceTier;
  premium: number;
}

interface TierConfig {
  id: InsuranceTier;
  label: string;
  rate: number;
  covered: string[];
  notCovered: string[];
}

interface InsuranceSelectorProps {
  onSelect: (selection: InsuranceSelection) => void;
}

// ─── Tier definitions ────────────────────────────────────────────────────────

const TIERS: TierConfig[] = [
  {
    id: 'basic',
    label: 'Basic',
    rate: 0.005,
    covered: ['Loss or theft', 'Total damage'],
    notCovered: ['Partial damage', 'Delay compensation', 'Perishable goods'],
  },
  {
    id: 'standard',
    label: 'Standard',
    rate: 0.01,
    covered: ['Loss or theft', 'Total & partial damage', 'Delay compensation'],
    notCovered: ['Perishable goods', 'Hazardous materials'],
  },
  {
    id: 'premium',
    label: 'Premium',
    rate: 0.02,
    covered: [
      'Loss or theft',
      'Total & partial damage',
      'Delay compensation',
      'Perishable goods',
      'Hazardous materials (select)',
    ],
    notCovered: [],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function InsuranceSelector({ onSelect }: InsuranceSelectorProps) {
  const [selectedTier, setSelectedTier] = useState<InsuranceTier>('standard');
  const [declaredValue, setDeclaredValue] = useState<string>('');

  const numericValue = parseFloat(declaredValue) || 0;

  const handleSelect = (tier: InsuranceTier) => {
    setSelectedTier(tier);
    const config = TIERS.find((t) => t.id === tier)!;
    onSelect({ tier, premium: numericValue * config.rate });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeclaredValue(e.target.value);
    const config = TIERS.find((t) => t.id === selectedTier)!;
    onSelect({ tier: selectedTier, premium: (parseFloat(e.target.value) || 0) * config.rate });
  };

  return (
    <div className="space-y-5">
      {/* Declared value input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Declared Shipment Value (USD)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={declaredValue}
          onChange={handleValueChange}
          placeholder="e.g. 5000.00"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Tier cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {TIERS.map((tier) => {
          const premium = numericValue * tier.rate;
          const active = selectedTier === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => handleSelect(tier.id)}
              className={cn(
                'flex flex-col rounded-xl border-2 p-4 text-left transition focus:outline-none',
                active
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-indigo-300',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{tier.label}</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                  {(tier.rate * 100).toFixed(1)}%
                </span>
              </div>

              <p className="mt-1 text-xl font-bold text-indigo-600">
                {premium > 0
                  ? `$${premium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '—'}
              </p>
              <p className="text-xs text-gray-400">premium</p>

              <div className="mt-3 space-y-1">
                {tier.covered.map((item) => (
                  <p key={item} className="flex items-start gap-1 text-xs text-gray-600">
                    <span className="mt-px text-green-500">✓</span> {item}
                  </p>
                ))}
                {tier.notCovered.map((item) => (
                  <p key={item} className="flex items-start gap-1 text-xs text-gray-400">
                    <span className="mt-px text-red-400">✗</span> {item}
                  </p>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
