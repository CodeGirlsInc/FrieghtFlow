// frontend/components/shipments/QuoteComparisonTable.tsx
import React from 'react';

export interface QuoteOption {
  id: string;
  providerName: string;
  price: number;
  currency: string;
  estimatedDeliveryDays: number;
  reliabilityScore: number;
}

export interface QuoteComparisonProps {
  quotes: QuoteOption[];
  onSelectQuote: (quoteId: string) => void;
}

export const QuoteComparisonTable: React.FC<QuoteComparisonProps> = ({ quotes, onSelectQuote }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Provider</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Delivery Time</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Reliability</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 font-medium text-gray-900">{quote.providerName}</td>
              <td className="px-4 py-4 text-gray-700">{quote.price.toFixed(2)} {quote.currency}</td>
              <td className="px-4 py-4 text-gray-700">{quote.estimatedDeliveryDays} days</td>
              <td className="px-4 py-4 text-gray-700">{(quote.reliabilityScore * 100).toFixed(0)}%</td>
              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => onSelectQuote(quote.id)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium"
                >
                  Select Quote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};