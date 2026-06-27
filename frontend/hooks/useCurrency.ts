'use client';

import { useCurrencyStore } from '@/stores/currency.store';

export function useCurrency() {
  const { currency, setCurrency, convert, format } = useCurrencyStore();
  return { currency, setCurrency, convert, format };
}
