'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

/** 1,000,000 kg ≈ 1,000 tonnes — well past any single commercial road/sea leg. */
const MAX_WEIGHT_KG = 1_000_000;
const MAX_WEIGHT_KG_LABEL = MAX_WEIGHT_KG.toLocaleString('en-US');

/**
 * Every field stays a string (the raw <input> value) so the schema can
 * distinguish "left blank" from "zero", and the payload is built with
 * Number() once validation has passed.
 */
const schema = z.object({
  origin: z.string().trim().min(1, 'Origin is required'),
  destination: z.string().trim().min(1, 'Destination is required'),
  weightKg: z
    .string()
    .trim()
    .min(1, 'Weight is required')
    .superRefine((value, ctx) => {
      if (value === '') return; // already reported as required
      const n = Number(value);
      if (!Number.isFinite(n)) {
        ctx.addIssue({ code: 'custom', message: 'Weight must be a number' });
        return;
      }
      if (n <= 0) {
        ctx.addIssue({ code: 'custom', message: 'Weight must be greater than 0' });
        return;
      }
      if (n > MAX_WEIGHT_KG) {
        ctx.addIssue({
          code: 'custom',
          message: `Weight must be ${MAX_WEIGHT_KG_LABEL} kg or less`,
        });
      }
    }),
  volumeCbm: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0),
      'Volume must be 0 or greater',
    ),
  cargoCategory: z.string().min(1, 'Cargo category is required'),
});

type FormData = z.infer<typeof schema>;

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
  const [quote, setQuote] = useState<CostBreakdown | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin: '',
      destination: '',
      weightKg: '',
      volumeCbm: '',
      cargoCategory: 'Other',
    },
  });

  const onSubmit = async (data: FormData) => {
    let breakdown: CostBreakdown;
    try {
      breakdown = await apiClient<CostBreakdown>('/shipments/calculate-cost', {
        method: 'POST',
        body: JSON.stringify({
          origin: data.origin,
          destination: data.destination,
          weightKg: Number(data.weightKg),
          volumeCbm: data.volumeCbm ? Number(data.volumeCbm) : undefined,
          cargoCategory: data.cargoCategory,
        }),
      });
    } catch {
      toast.error('Failed to calculate cost');
      return;
    }
    setQuote(breakdown);
  };

  const handleCreateShipment = () => {
    const form = getValues();
    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      weightKg: form.weightKg,
      ...(form.volumeCbm && { volumeCbm: form.volumeCbm }),
      cargoCategory: form.cargoCategory,
      ...(quote && { price: String(quote.total) }),
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="calc-origin">Origin</Label>
              <Input
                id="calc-origin"
                placeholder="e.g. New York"
                aria-invalid={errors.origin ? true : undefined}
                aria-describedby={errors.origin ? 'calc-origin-error' : undefined}
                {...register('origin')}
              />
              {errors.origin && (
                <p id="calc-origin-error" role="alert" className="text-xs text-destructive">
                  {errors.origin.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="calc-dest">Destination</Label>
              <Input
                id="calc-dest"
                placeholder="e.g. Los Angeles"
                aria-invalid={errors.destination ? true : undefined}
                aria-describedby={errors.destination ? 'calc-dest-error' : undefined}
                {...register('destination')}
              />
              {errors.destination && (
                <p id="calc-dest-error" role="alert" className="text-xs text-destructive">
                  {errors.destination.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="calc-weight">Weight (kg)</Label>
              <Input
                id="calc-weight"
                type="number"
                step={0.1}
                placeholder="100"
                aria-invalid={errors.weightKg ? true : undefined}
                aria-describedby={
                  errors.weightKg ? 'calc-weight-error calc-weight-hint' : 'calc-weight-hint'
                }
                {...register('weightKg')}
              />
              <p id="calc-weight-hint" className="text-xs text-muted-foreground">
                Must be greater than 0 and no more than {MAX_WEIGHT_KG_LABEL} kg.
              </p>
              {errors.weightKg && (
                <p id="calc-weight-error" role="alert" className="text-xs text-destructive">
                  {errors.weightKg.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="calc-volume">Volume m³ (optional)</Label>
              <Input
                id="calc-volume"
                type="number"
                step={0.01}
                placeholder="2.5"
                aria-invalid={errors.volumeCbm ? true : undefined}
                aria-describedby={errors.volumeCbm ? 'calc-volume-error' : undefined}
                {...register('volumeCbm')}
              />
              {errors.volumeCbm && (
                <p id="calc-volume-error" role="alert" className="text-xs text-destructive">
                  {errors.volumeCbm.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="calc-category">Cargo Category</Label>
            <select
              id="calc-category"
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground"
              {...register('cargoCategory')}
            >
              {CARGO_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Calculating…' : 'Calculate Cost'}
          </Button>
        </form>

        {quote && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold">Price Breakdown</p>
            <div className="space-y-1 text-sm">
              {[
                ['Base Rate', quote.baseRate],
                ['Weight Charge', quote.weightCharge],
                ['Volume Charge', quote.volumeCharge],
                ['Category Multiplier', quote.categoryMultiplier],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-muted-foreground">
                  <span>{label}</span>
                  <span>{typeof val === 'number' && label === 'Category Multiplier' ? `×${val}` : fmt(val as number, quote.currency)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-foreground border-t pt-1 mt-1">
                <span>Total</span>
                <span>{fmt(quote.total, quote.currency)}</span>
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
