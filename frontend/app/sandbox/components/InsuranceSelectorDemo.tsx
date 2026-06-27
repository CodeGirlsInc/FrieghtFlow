'use client';

import { useState } from 'react';
import { InsuranceSelector, InsuranceSelection } from './InsuranceSelector';

export function InsuranceSelectorDemo() {
  const [selection, setSelection] = useState<InsuranceSelection | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <InsuranceSelector onSelect={setSelection} />
      {selection && (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-sm text-indigo-800">
            <span className="font-semibold capitalize">{selection.tier}</span> tier selected —
            premium:{' '}
            <span className="font-bold">
              ${selection.premium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
