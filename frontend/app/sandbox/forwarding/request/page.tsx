'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SERVICES = ['Customs Clearance', 'Warehousing', 'Last-Mile Delivery'] as const;
type Service = (typeof SERVICES)[number];

const schema = z.object({
  originCountry: z.string().min(2, 'Origin country is required'),
  originPort: z.string().min(2, 'Origin port is required'),
  destinationCountry: z.string().min(2, 'Destination country is required'),
  destinationPort: z.string().min(2, 'Destination port is required'),
  cargoDescription: z.string().min(3, 'Cargo description is required'),
  hsCode: z.string().regex(/^\d{6,10}$/, 'HS code must be 6–10 digits'),
  incoterms: z.string().min(2, 'Incoterms are required'),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  departureDate: z.string().min(1, 'Departure date is required'),
  specialInstructions: z.string().max(500, 'Max 500 characters').optional(),
});

type FormValues = z.infer<typeof schema>;

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function generateRef(): string {
  return 'FF-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

export default function FreightForwardingRequestPage() {
  const [refNumber, setRefNumber] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { services: [] },
  });

  const watchedServices = watch('services') ?? [];
  const watchedInstructions = watch('specialInstructions') ?? '';

  function toggleService(s: Service) {
    const current = watchedServices as string[];
    setValue(
      'services',
      current.includes(s) ? current.filter((x) => x !== s) : [...current, s],
      { shouldValidate: true },
    );
  }

  function onSubmit(_data: FormValues) {
    setRefNumber(generateRef());
  }

  if (refNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-sm text-gray-500 mb-4">Your freight forwarding request has been received.</p>
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-6 py-3">
            <p className="text-xs text-blue-500 uppercase tracking-wide">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-blue-700">{refNumber}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Freight Forwarding Request</h1>
        <p className="text-sm text-gray-500 mb-6">Request forwarding services for international shipments</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Origin Country" error={errors.originCountry?.message}>
              <input className={inputCls} {...register('originCountry')} placeholder="United States" />
            </Field>
            <Field label="Origin Port" error={errors.originPort?.message}>
              <input className={inputCls} {...register('originPort')} placeholder="Port of Los Angeles" />
            </Field>
            <Field label="Destination Country" error={errors.destinationCountry?.message}>
              <input className={inputCls} {...register('destinationCountry')} placeholder="Germany" />
            </Field>
            <Field label="Destination Port" error={errors.destinationPort?.message}>
              <input className={inputCls} {...register('destinationPort')} placeholder="Port of Hamburg" />
            </Field>
          </div>

          {/* Cargo */}
          <Field label="Cargo Description" error={errors.cargoDescription?.message}>
            <input className={inputCls} {...register('cargoDescription')} placeholder="Electronic components, 200 cartons" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="HS Code" error={errors.hsCode?.message}>
              <input className={inputCls} {...register('hsCode')} placeholder="847130" />
            </Field>
            <Field label="Incoterms" error={errors.incoterms?.message}>
              <select className={inputCls} {...register('incoterms')}>
                <option value="">Select Incoterms</option>
                {['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Required Services */}
          <Field label="Required Services" error={errors.services?.message}>
            <div className="flex flex-wrap gap-3 mt-1">
              {SERVICES.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedServices.includes(s)}
                    onChange={() => toggleService(s)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </Field>

          {/* Date */}
          <Field label="Preferred Departure Date" error={errors.departureDate?.message}>
            <input className={inputCls} type="date" {...register('departureDate')} />
          </Field>

          {/* Special Instructions */}
          <Field label={`Special Instructions (${watchedInstructions.length}/500)`} error={errors.specialInstructions?.message}>
            <textarea
              className={inputCls + ' resize-none'}
              rows={3}
              maxLength={500}
              {...register('specialInstructions')}
              placeholder="Any special handling requirements..."
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
