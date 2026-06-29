'use client';
// #981 – Rate calculator page: instant price estimation UI
import { useState } from 'react';
import { apiClient } from '../../../../lib/api/client';

interface Estimate { minPrice: number; maxPrice: number; currency: string; estimatedDays: number; }

export default function QuotePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    setLoading(true);
    try {
      const r = await apiClient<Estimate>('/quotes/estimate', { method: 'POST', body: JSON.stringify({ origin, destination, weightKg: parseFloat(weight), cargoCategory: 'general' }) });
      setResult(r);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Get a Rate Estimate</h1>
      <input placeholder="Origin city" value={origin} onChange={e => setOrigin(e.target.value)} className="w-full rounded border px-3 py-2 text-sm"/>
      <input placeholder="Destination city" value={destination} onChange={e => setDestination(e.target.value)} className="w-full rounded border px-3 py-2 text-sm"/>
      <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="w-full rounded border px-3 py-2 text-sm"/>
      <button onClick={estimate} disabled={loading||!origin||!destination||!weight} className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{loading?'Estimating…':'Get Estimate'}</button>
      {result && (
        <div className="rounded-lg border bg-blue-50 p-4 space-y-1">
          <p className="font-semibold text-blue-800">Estimated Price</p>
          <p className="text-2xl font-bold">${result.minPrice} – ${result.maxPrice} <span className="text-sm font-normal">{result.currency}</span></p>
          <p className="text-sm text-gray-500">Delivery: ~{result.estimatedDays} day{result.estimatedDays > 1 ? 's' : ''}</p>
          <p className="text-xs text-gray-400">Estimates may vary.</p>
        </div>
      )}
    </div>
  );
}
