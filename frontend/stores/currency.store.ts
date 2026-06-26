'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN';

const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1610,
};

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
};

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (amount: number) => number;
  format: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
      convert: (amount) => amount * RATES[get().currency],
      format: (amount) => {
        const converted = amount * RATES[get().currency];
        const sym = SYMBOLS[get().currency];
        return `${sym}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    }),
    { name: 'ff-currency' }
  )
);
