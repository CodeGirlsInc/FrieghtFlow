'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

// ── Schemas per step ──────────────────────────────────────────────────────────

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
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().length(3, 'Must be 3 characters').default('USD'),
  pickupDate: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
});

const step4Schema = z.object({
  notes: z.string().max(2000).optional(),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema).merge(step4Schema);
type FormValues = z.infer<typeof fullSchema>;

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Route', description: 'Origin & destination' },
  { label: 'Cargo', description: 'What are you shipping?' },
  { label: 'Pricing & Dates', description: 'Cost and schedule' },
  { label: 'Review', description: 'Confirm and submit' },
];

// ── Discard guard (#1512) ─────────────────────────────────────────────────────

// Every field of the form, across all four steps. A step that is currently
// unmounted still reports its value here — react-hook-form only drops values
// when `shouldUnregister` is set, which this form doesn't do.
const ALL_FIELDS: (keyof FormValues)[] = [
  'origin',
  'destination',
  'cargoDescription',
  'weightKg',
  'volumeCbm',
  'price',
  'currency',
  'pickupDate',
  'estimatedDeliveryDate',
  'notes',
];

// The only field that starts out with a value; everything else begins empty.
// A draft handed over through query params (price calculator, "Contact/Hire")
// therefore counts as unsaved work that would be lost on cancel.
const FIELD_DEFAULTS: Partial<Record<keyof FormValues, string>> = { currency: 'USD' };

/**
 * "Dirty" means: at least one field holds something other than empty or its
 * default. Deliberately not react-hook-form's own `isDirty`, which compares
 * against `defaultValues` and would therefore report a prefilled draft as
 * pristine even though the shipper would lose it.
 */
function isFormDirty(values: Partial<FormValues>): boolean {
  return ALL_FIELDS.some((field) => {
    const value = values[field];
    if (value === undefined || value === null || value === '') return false;
    return String(value) !== (FIELD_DEFAULTS[field] ?? '');
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewShipmentPage() {
  return (
    <Suspense fallback={null}>
      <NewShipmentForm />
    </Suspense>
  );
}

// Confirmation idiom copied from the admin disputes page's ConfirmDialog
// (same overlay, panel and Cancel/Confirm button pairing), with the
// role="dialog" / aria-modal / Escape / focus handling ACCESSIBILITY.md asks
// for and the disputes dialog is still missing.
function DiscardChangesDialog({
  onKeepEditing,
  onDiscard,
}: {
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  const headingId = 'discard-shipment-heading';

  useEffect(() => {
    keepEditingRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onKeepEditing();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onKeepEditing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <h3 id={headingId} className="font-semibold text-foreground">
          Discard this shipment?
        </h3>
        <p className="text-sm text-muted-foreground">
          The route, cargo, pricing and schedule details you&apos;ve entered will be lost.
          This can&apos;t be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button ref={keepEditingRef} variant="outline" size="sm" onClick={onKeepEditing}>
            Keep editing
          </Button>
          <Button variant="destructive" size="sm" onClick={onDiscard}>
            Discard and leave
          </Button>
        </div>
      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary above it (see the
// wrapper above) to avoid opting the whole route out of static
// rendering.
function NewShipmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);

  // The furthest step reached so far. The form only advances through
  // `advance()`, which validates the current step's fields first, so every
  // step below this index is known-good and safe to jump back to. Anything at
  // or above it stays gated behind the Next button.
  const [furthestStep, setFurthestStep] = useState(0);

  const [isDirty, setIsDirty] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Two flows hand off a prefilled draft via query params: the price
  // calculator (origin, destination, weightKg, volumeCbm, price — it
  // also sends cargoCategory, which has no corresponding field on this
  // form/CreateShipmentPayload, so it's not read here) and a carrier's
  // "Contact / Hire" button (carrierId, carrierName — surfaced below as
  // an informational banner, since shipment creation itself has no
  // carrier-assignment field to submit them into).
  const numericParam = (key: string) => {
    const raw = searchParams.get(key);
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };
  const carrierId = searchParams.get('carrierId') ?? undefined;
  const carrierName = searchParams.get('carrierName') ?? undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema) as Resolver<FormValues>,
    defaultValues: {
      currency: 'USD',
      origin: searchParams.get('origin') ?? undefined,
      destination: searchParams.get('destination') ?? undefined,
      weightKg: numericParam('weightKg'),
      volumeCbm: numericParam('volumeCbm'),
      price: numericParam('price'),
    },
    mode: 'onTouched',
  });

  const { register, handleSubmit, trigger, getValues, formState: { errors, isSubmitting } } = form;

  // Track whether anything has been typed, across every step, so cancelling
  // only nags when there is genuinely something to lose. Evaluated once on
  // mount too: a draft handed over through query params is already filled in
  // before the first edit.
  useEffect(() => {
    setIsDirty(isFormDirty(form.getValues()));
    const subscription = form.watch((values) => {
      setIsDirty(isFormDirty(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // A refresh or tab close is the one exit a dialog cannot intercept. The
  // browser shows its own generic wording here — `beforeunload` custom
  // messages are not allowed.
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Validate only the fields belonging to the current step before advancing
  const stepFields: (keyof FormValues)[][] = [
    ['origin', 'destination'],
    ['cargoDescription', 'weightKg', 'volumeCbm'],
    ['price', 'currency', 'pickupDate', 'estimatedDeliveryDate'],
    ['notes'],
  ];

  const advance = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) {
      const next = step + 1;
      setStep(next);
      setFurthestStep((f) => Math.max(f, next));
    }
  };

  const requestLeave = () => {
    if (!isDirty) {
      router.back();
      return;
    }
    setConfirmingDiscard(true);
  };

  // Dismissing the dialog puts focus back on the control that opened it.
  const keepEditing = () => {
    setConfirmingDiscard(false);
    cancelButtonRef.current?.focus();
  };

  const discard = () => {
    setConfirmingDiscard(false);
    router.back();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        volumeCbm: data.volumeCbm === '' ? undefined : Number(data.volumeCbm),
      };
      const shipment = await shipmentApi.create(payload);
      toast.success('Shipment created!');
      router.push(`/shipments/${shipment.id}`);
    } catch {
      toast.error('Failed to create shipment. Please try again.');
    }
  };

  const values = getValues();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create Shipment</h1>
        <p className="text-muted-foreground text-sm mt-1">Post a new shipment for carriers to accept.</p>
      </div>

      {/* Step progress indicator */}
      <nav aria-label="Shipment creation steps">
        <ol className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const isCurrent = i === step;
            const isCompleted = i < step;
            // Only steps the form has already passed — and therefore already
            // validated — can be jumped back to. The current step is a
            // disabled marker rather than a control pretending to be one.
            const canJumpBack = !isCurrent && i < furthestStep;
            const state = isCurrent
              ? 'current step'
              : isCompleted
              ? 'completed'
              : 'not yet available';

            return (
              <li key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    disabled={!canJumpBack}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${i + 1} of ${STEPS.length}: ${s.label} — ${state}`}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default ${
                      i < step
                        ? 'bg-primary border-primary text-primary-foreground'
                        : i === step
                        ? 'border-primary text-primary bg-background'
                        : 'border-muted text-muted-foreground bg-background'
                    }`}
                  >
                    {i < step ? '✓' : i + 1}
                  </button>
                  <span
                    aria-hidden="true"
                    className={`text-xs mt-1 font-medium ${i === step ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 – Route */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Route Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {carrierId && (
                <p className="sm:col-span-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Creating this shipment to hand off to{' '}
                  <span className="font-medium text-foreground">{carrierName ?? 'this carrier'}</span>.
                  Carrier assignment isn&apos;t part of shipment creation yet — you&apos;ll need to
                  assign them separately after the shipment is created.
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="origin">Origin *</Label>
                <Input id="origin" placeholder="Lagos, Nigeria" {...register('origin')} />
                {errors.origin && <p className="text-xs text-destructive">{errors.origin.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination">Destination *</Label>
                <Input id="destination" placeholder="Abuja, Nigeria" {...register('destination')} />
                {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
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
                {errors.cargoDescription && <p className="text-xs text-destructive">{errors.cargoDescription.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="weightKg">Weight (kg) *</Label>
                  <Input id="weightKg" type="number" step="0.01" placeholder="500" {...register('weightKg')} />
                  {errors.weightKg && <p className="text-xs text-destructive">{errors.weightKg.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="volumeCbm">Volume (m³) — optional</Label>
                  <Input id="volumeCbm" type="number" step="0.001" placeholder="2.5" {...register('volumeCbm')} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 – Pricing & Dates */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing &amp; Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" type="number" step="0.01" placeholder="1500.00" {...register('price')} />
                  {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" placeholder="USD" maxLength={3} {...register('currency')} />
                  {errors.currency && <p className="text-xs text-destructive">{errors.currency.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="pickupDate">Pickup Date</Label>
                  <Input id="pickupDate" type="datetime-local" {...register('pickupDate')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estimatedDeliveryDate">Estimated Delivery</Label>
                  <Input id="estimatedDeliveryDate" type="datetime-local" {...register('estimatedDeliveryDate')} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 – Review & Submit */}
        {step === 3 && (
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
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{values.price} {values.currency}</span>
                  {values.pickupDate && (
                    <>
                      <span className="text-muted-foreground">Pickup</span>
                      <span className="font-medium">{new Date(values.pickupDate).toLocaleString()}</span>
                    </>
                  )}
                  {values.estimatedDeliveryDate && (
                    <>
                      <span className="text-muted-foreground">Est. Delivery</span>
                      <span className="font-medium">{new Date(values.estimatedDeliveryDate).toLocaleString()}</span>
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
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? requestLeave() : setStep((s) => s - 1))}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={advance}>
              Next →
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Shipment'}
            </Button>
          )}
        </div>
      </form>

      {confirmingDiscard && (
        <DiscardChangesDialog onKeepEditing={keepEditing} onDiscard={discard} />
      )}
    </div>
  );
}
