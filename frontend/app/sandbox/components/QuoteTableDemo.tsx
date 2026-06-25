'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { QuoteComparisonTable } from './QuoteComparisonTable';
import type { CarrierQuote } from './QuoteComparisonTable';

interface QuoteTableDemoProps {
  quotes: CarrierQuote[];
}

export function QuoteTableDemo({ quotes }: QuoteTableDemoProps) {
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const accepted = quotes.find((q) => q.id === acceptedId);

  return (
    <div className="space-y-4">
      {accepted && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <span>
            Quote accepted: <span className="font-semibold">{accepted.carrierName}</span>
          </span>
          <button
            onClick={() => setAcceptedId(null)}
            className="ml-auto text-xs text-green-600 underline hover:text-green-800"
          >
            Clear
          </button>
        </div>
      )}
      <QuoteComparisonTable quotes={quotes} onAccept={setAcceptedId} />
    </div>
  );
}
