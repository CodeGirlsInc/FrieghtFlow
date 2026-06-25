'use client';

import { Star, Check, X, Zap, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarrierQuote {
  id: string;
  carrierName: string;
  rating: number;
  estimatedDelivery: string;
  deliveryDays: number;
  price: number;
  currency?: string;
  insuranceIncluded: boolean;
}

interface QuoteComparisonTableProps {
  quotes: CarrierQuote[];
  onAccept: (quoteId: string) => void;
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-100 text-gray-300',
          )}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500">{value.toFixed(1)}</span>
    </div>
  );
}

export function QuoteComparisonTable({ quotes, onAccept }: QuoteComparisonTableProps) {
  const lowestPrice = Math.min(...quotes.map((q) => q.price));
  const fastestDays = Math.min(...quotes.map((q) => q.deliveryDays));

  const formatPrice = (price: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(price);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {['Carrier', 'Rating', 'Est. Delivery', 'Price', 'Insurance', 'Actions'].map((h) => (
              <th
                key={h}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500',
                  h === 'Insurance' ? 'text-center' : h === 'Actions' ? 'text-right' : 'text-left',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quotes.map((quote) => {
            const isCheapest = quote.price === lowestPrice;
            const isFastest  = quote.deliveryDays === fastestDays;

            return (
              <tr
                key={quote.id}
                className={cn(
                  'transition-colors',
                  isCheapest && isFastest  && 'bg-green-50 hover:bg-green-100/60',
                  isCheapest && !isFastest && 'bg-green-50 hover:bg-green-100/60',
                  isFastest  && !isCheapest && 'bg-blue-50 hover:bg-blue-100/60',
                  !isCheapest && !isFastest && 'hover:bg-gray-50',
                )}
              >
                {/* Carrier */}
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{quote.carrierName}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {isCheapest && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        <TrendingDown className="h-2.5 w-2.5" />
                        Best Price
                      </span>
                    )}
                    {isFastest && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        <Zap className="h-2.5 w-2.5" />
                        Fastest
                      </span>
                    )}
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4 py-4">
                  <StarRating value={quote.rating} />
                </td>

                {/* Est. Delivery */}
                <td className="px-4 py-4">
                  <span className={cn('font-medium', isFastest ? 'text-blue-700' : 'text-gray-900')}>
                    {quote.estimatedDelivery}
                  </span>
                  <div className="text-xs text-gray-400">
                    {quote.deliveryDays} day{quote.deliveryDays !== 1 ? 's' : ''}
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-4">
                  <span className={cn('text-base font-semibold', isCheapest ? 'text-green-700' : 'text-gray-900')}>
                    {formatPrice(quote.price, quote.currency)}
                  </span>
                </td>

                {/* Insurance */}
                <td className="px-4 py-4 text-center">
                  {quote.insuranceIncluded ? (
                    <Check className="mx-auto h-4 w-4 text-green-500" strokeWidth={2.5} />
                  ) : (
                    <X className="mx-auto h-4 w-4 text-gray-300" strokeWidth={2} />
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() => onAccept(quote.id)}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                  >
                    Accept Quote
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
