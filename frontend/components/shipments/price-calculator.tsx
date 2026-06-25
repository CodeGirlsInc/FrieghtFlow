'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api/client';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const CARGO_CATEGORIES = [
  'Electronics', 'Furniture', 'Food & Beverage', 'Clothing',
  'Machinery', 'Chemicals', 'Automotive', 'Medical', 'Other',
];

interface CostBreakdown {
  baseRate: number;
  weightCharge: number;
  volumeCharge: number;
  categoryMultiplier: number;
  total: number;
  currency: string;
}

export function PriceCalculator() {
  const router = useRouter();
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    weightKg: '',
    volumeCbm: '',
    cargoCategory: 'Other',
  });
  const [result, setResult] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.weightKg) {
      toast.error('Origin, destination, and weight are required');
      return;
    }
    setLoading(true);
    try {
      const breakdown = await apiClient<CostBreakdown>('/shipments/calculate-cost', {
        method: 'POST',
        body: JSON.stringify({
          origin: form.origin,
          destination: form.destination,
          weightKg: Number(form.weightKg),
          volumeCbm: form.volumeCbm ? Number(form.volumeCbm) : undefined,
          cargoCategory: form.cargoCategory,
        }),
      });
      setResult(breakdown);
    } catch {
      toast.error('Failed to calculate cost');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = () => {
    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      weightKg: form.weightKg,
      ...(form.volumeCbm && { volumeCbm: form.volumeCbm }),
      cargoCategory: form.cargoCategory,
      ...(result && { price: String(result.total) }),
    });
    router.push(`/shipments/new?${params.toString()}`);
  };

  const fmt = (n: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Price Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="calc-origin">Origin</Label>
              <Input id="calc-origin" placeholder="e.g. New York" value={form.origin} onChange={(e) => set('origin', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="calc-dest">Destination</Label>
              <Input id="calc-dest" placeholder="e.g. Los Angeles" value={form.destination} onChange={(e) => set('destination', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="calc-weight">Weight (kg)</Label>
              <Input id="calc-weight" type="number" min={0.1} step={0.1} placeholder="100" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="calc-volume">Volume m³ (optional)</Label>
              <Input id="calc-volume" type="number" min={0} step={0.01} placeholder="2.5" value={form.volumeCbm} onChange={(e) => set('volumeCbm', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="calc-category">Cargo Category</Label>
            <select
              id="calc-category"
              value={form.cargoCategory}
              onChange={(e) => set('cargoCategory', e.target.value)}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
            >
              {CARGO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Calculating…' : 'Calculate Cost'}
          </Button>
        </form>

        {result && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold">Price Breakdown</p>
            <div className="space-y-1 text-sm">
              {[
                ['Base Rate', result.baseRate],
                ['Weight Charge', result.weightCharge],
                ['Volume Charge', result.volumeCharge],
                ['Category Multiplier', result.categoryMultiplier],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-muted-foreground">
                  <span>{label}</span>
                  <span>{typeof val === 'number' && label === 'Category Multiplier' ? `×${val}` : fmt(val as number, result.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-foreground border-t pt-1 mt-1">
                <span>Total</span>
                <span>{fmt(result.total, result.currency)}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleCreateShipment}>
              Create Shipment with This Quote →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
