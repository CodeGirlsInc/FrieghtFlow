'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';

// ── Step Schemas ───────────────────────────────────────────────────────────────

const step1Schema = z.object({
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
});

const step2Schema = z.object({
  cargoDescription: z.string().min(10, 'Describe the cargo (min 10 chars)'),
  weightKg: z.coerce.number().positive('Weight must be positive'),
  volumeCbm: z.coerce.number().positive().optional().or(z.literal('')),
});

const step3Schema = z.object({
  pickupDate: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  requiresRefrigeration: z.boolean().optional(),
  isHazardous: z.boolean().optional(),
});

const step4Schema = z.object({
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().length(3, 'Must be 3 characters').default('USD'),
});

const step5Schema = z.object({
  notes: z.string().max(2000).optional(),
});

const fullSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

type FormValues = z.infer<typeof fullSchema>;

// ── Step Metadata ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Route', description: 'Origin & destination' },
  { label: 'Cargo', description: 'What are you shipping?' },
  { label: 'Logistics', description: 'Pickup & handling' },
  { label: 'Pricing', description: 'Cost details' },
  { label: 'Review', description: 'Confirm and submit' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export function CreateShipmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema) as Resolver<FormValues>,
    defaultValues: { currency: 'USD', requiresRefrigeration: false, isHazardous: false },
    mode: 'onTouched',
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const requiresRefrigeration = watch('requiresRefrigeration');
  const isHazardous = watch('isHazardous');

  const stepFields: (keyof FormValues)[][] = [
    ['origin', 'destination'],
    ['cargoDescription', 'weightKg', 'volumeCbm'],
    ['pickupDate', 'estimatedDeliveryDate'],
    ['price', 'currency'],
    ['notes'],
  ];

  const advance = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const createShipmentMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiClient('/shipments', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          volumeCbm: data.volumeCbm === '' ? undefined : Number(data.volumeCbm),
        }),
      }),
    onSuccess: (shipment: { id: string }) => {
      toast.success('Shipment created successfully!');
      router.push(`/shipments/${shipment.id}`);
    },
    onError: () => {
      toast.error('Failed to create shipment. Please try again.');
    },
  });

  const onSubmit = async (data: FormValues) => {
    createShipmentMutation.mutate(data);
  };

  const values = getValues();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create Shipment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Post a new shipment for carriers to accept.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  i < step
                    ? 'bg-primary border-primary text-primary-foreground'
                    : i === step
                      ? 'border-primary text-primary bg-background'
                      : 'border-muted text-muted-foreground bg-background'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${i === step ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? 'bg-primary' : 'bg-muted'}`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 – Route */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Route Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="origin">Origin *</Label>
                <Input id="origin" placeholder="Lagos, Nigeria" {...register('origin')} />
                {errors.origin && (
                  <p className="text-xs text-destructive">{errors.origin.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination">Destination *</Label>
                <Input id="destination" placeholder="Abuja, Nigeria" {...register('destination')} />
                {errors.destination && (
                  <p className="text-xs text-destructive">{errors.destination.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 – Cargo */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cargo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cargoDescription">Description *</Label>
                <textarea
                  id="cargoDescription"
                  rows={3}
                  placeholder="Describe the cargo contents, handling requirements, etc."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  {...register('cargoDescription')}
                />
                {errors.cargoDescription && (
                  <p className="text-xs text-destructive">{errors.cargoDescription.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="weightKg">Weight (kg) *</Label>
                  <Input
                    id="weightKg"
                    type="number"
                    step="0.01"
                    placeholder="500"
                    {...register('weightKg')}
                  />
                  {errors.weightKg && (
                    <p className="text-xs text-destructive">{errors.weightKg.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="volumeCbm">Volume (m³) — optional</Label>
                  <Input
                    id="volumeCbm"
                    type="number"
                    step="0.001"
                    placeholder="2.5"
                    {...register('volumeCbm')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 – Logistics */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logistics &amp; Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="pickupDate">Pickup Date</Label>
                  <Input
                    id="pickupDate"
                    type="datetime-local"
                    {...register('pickupDate')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estimatedDeliveryDate">Estimated Delivery</Label>
                  <Input
                    id="estimatedDeliveryDate"
                    type="datetime-local"
                    {...register('estimatedDeliveryDate')}
                  />
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresRefrigeration ?? false}
                    onChange={(e) => setValue('requiresRefrigeration', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Requires Refrigeration</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHazardous ?? false}
                    onChange={(e) => setValue('isHazardous', e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">Hazardous Material</span>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 – Pricing */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="1500.00"
                  {...register('price')}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  maxLength={3}
                  {...register('currency')}
                />
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5 – Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review &amp; Submit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="font-medium">{values.origin}</span>
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium">{values.destination}</span>
                  <span className="text-muted-foreground">Cargo</span>
                  <span className="font-medium">{values.cargoDescription}</span>
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{values.weightKg} kg</span>
                  {values.volumeCbm && (
                    <>
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">{values.volumeCbm} m³</span>
                    </>
                  )}
                  {values.requiresRefrigeration && (
                    <>
                      <span className="text-muted-foreground">Refrigerated</span>
                      <span className="font-medium">Yes</span>
                    </>
                  )}
                  {values.isHazardous && (
                    <>
                      <span className="text-muted-foreground">Hazardous</span>
                      <span className="font-medium">Yes</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {values.price} {values.currency}
                  </span>
                  {values.pickupDate && (
                    <>
                      <span className="text-muted-foreground">Pickup</span>
                      <span className="font-medium">
                        {new Date(values.pickupDate).toLocaleString()}
                      </span>
                    </>
                  )}
                  {values.estimatedDeliveryDate && (
                    <>
                      <span className="text-muted-foreground">Est. Delivery</span>
                      <span className="font-medium">
                        {new Date(values.estimatedDeliveryDate).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Any special instructions for the carrier..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  {...register('notes')}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={advance}>
              Next →
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || createShipmentMutation.isPending}
            >
              {createShipmentMutation.isPending ? 'Creating...' : 'Create Shipment'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
