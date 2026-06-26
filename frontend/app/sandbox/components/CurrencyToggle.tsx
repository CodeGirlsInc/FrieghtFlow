'use client';

import { useCurrency } from '@/hooks/useCurrency';
import type { Currency } from '@/stores/currency.store';

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'NGN'];

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Select currency"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
