'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  country: z.string().min(2, 'Country is required'),
});

const step2Schema = z.object({
  vehicleTypes: z.string().min(2, 'Vehicle types are required'),
  capacityTons: z.number().positive('Capacity must be positive'),
  fleetCount: z.number().int().positive('Fleet count must be positive'),
});

const step3Schema = z.object({
  originRegions: z.string().min(2, 'Origin regions are required'),
  destinationRegions: z.string().min(2, 'Destination regions are required'),
  cargoTypesAccepted: z.string().min(2, 'Cargo types are required'),
});

const step4Schema = z.object({
  businessLicense: z.string().min(1, 'Business license filename is required'),
  insuranceCertificate: z.string().min(1, 'Insurance certificate filename is required'),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;
type Step4 = z.infer<typeof step4Schema>;

type FormData = Step1 & Step2 & Step3 & Step4;

const STEPS = ['Business Details', 'Fleet Info', 'Service Areas', 'Documents', 'Review & Submit'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {STEPS.map((label, i) => (
          <span
            key={i}
            className={`text-xs font-medium ${i < current ? 'text-blue-600' : i === current ? 'text-blue-800 font-bold' : 'text-gray-400'}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all"
          style={{ width: `${((current) / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

// ── Steps ─────────────────────────────────────────────────────────────────────

function Step1Form({ data, onNext }: { data: Partial<Step1>; onNext: (d: Step1) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Field label="Company Name" error={errors.companyName?.message}>
        <input className={inputCls} {...register('companyName')} placeholder="Acme Freight Ltd." />
      </Field>
      <Field label="Registration Number" error={errors.registrationNumber?.message}>
        <input className={inputCls} {...register('registrationNumber')} placeholder="REG-123456" />
      </Field>
      <Field label="Country" error={errors.country?.message}>
        <input className={inputCls} {...register('country')} placeholder="United States" />
      </Field>
      <button type="submit" className="mt-2 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Next →
      </button>
    </form>
  );
}

function Step2Form({ data, onNext, onBack }: { data: Partial<Step2>; onNext: (d: Step2) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: data,
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Field label="Vehicle Types (e.g. Truck, Van, Flatbed)" error={errors.vehicleTypes?.message}>
        <input className={inputCls} {...register('vehicleTypes')} placeholder="Truck, Flatbed" />
      </Field>
      <Field label="Total Capacity (tons)" error={errors.capacityTons?.message}>
        <input className={inputCls} type="number" step="0.1" {...register('capacityTons', { valueAsNumber: true })} placeholder="50" />
      </Field>
      <Field label="Fleet Count" error={errors.fleetCount?.message}>
        <input className={inputCls} type="number" {...register('fleetCount', { valueAsNumber: true })} placeholder="10" />
      </Field>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">← Back</button>
        <button type="submit" className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">Next →</button>
      </div>
    </form>
  );
}

function Step3Form({ data, onNext, onBack }: { data: Partial<Step3>; onNext: (d: Step3) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step3>({
    resolver: zodResolver(step3Schema),
    defaultValues: data,
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Field label="Origin Regions" error={errors.originRegions?.message}>
        <input className={inputCls} {...register('originRegions')} placeholder="Northeast US, Midwest" />
      </Field>
      <Field label="Destination Regions" error={errors.destinationRegions?.message}>
        <input className={inputCls} {...register('destinationRegions')} placeholder="Southeast US, West Coast" />
      </Field>
      <Field label="Cargo Types Accepted" error={errors.cargoTypesAccepted?.message}>
        <input className={inputCls} {...register('cargoTypesAccepted')} placeholder="General, Hazmat, Refrigerated" />
      </Field>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">← Back</button>
        <button type="submit" className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">Next →</button>
      </div>
    </form>
  );
}

function Step4Form({ data, onNext, onBack }: { data: Partial<Step4>; onNext: (d: Step4) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step4>({
    resolver: zodResolver(step4Schema),
    defaultValues: data,
  });
  return (
    <form onSubmit={handleSubmit(onNext)}>
      <Field label="Business License (filename)" error={errors.businessLicense?.message}>
        <input className={inputCls} {...register('businessLicense')} placeholder="business-license.pdf" />
      </Field>
      <Field label="Insurance Certificate (filename)" error={errors.insuranceCertificate?.message}>
        <input className={inputCls} {...register('insuranceCertificate')} placeholder="insurance-cert.pdf" />
      </Field>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">← Back</button>
        <button type="submit" className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">Review →</button>
      </div>
    </form>
  );
}

function ReviewStep({ data, onBack, onSubmit }: { data: Partial<FormData>; onBack: () => void; onSubmit: () => void }) {
  const rows: [string, string | number | undefined][] = [
    ['Company Name', data.companyName],
    ['Registration Number', data.registrationNumber],
    ['Country', data.country],
    ['Vehicle Types', data.vehicleTypes],
    ['Capacity (tons)', data.capacityTons],
    ['Fleet Count', data.fleetCount],
    ['Origin Regions', data.originRegions],
    ['Destination Regions', data.destinationRegions],
    ['Cargo Types Accepted', data.cargoTypesAccepted],
    ['Business License', data.businessLicense],
    ['Insurance Certificate', data.insuranceCertificate],
  ];
  return (
    <div>
      <table className="w-full text-sm mb-6">
        <tbody>
          {rows.map(([label, val]) => (
            <tr key={label} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium text-gray-600 w-1/2">{label}</td>
              <td className="py-2 text-gray-900">{val ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">← Back</button>
        <button type="button" onClick={onSubmit} className="flex-1 rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">Submit Application</button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CarrierOnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const merge = (data: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...data }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-sm text-gray-500">Your carrier onboarding request has been received. We will review it and get back to you shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Carrier Onboarding</h1>
        <p className="text-sm text-gray-500 mb-6">Register your business, fleet, and service areas</p>
        <ProgressBar current={step} total={STEPS.length} />

        {step === 0 && (
          <Step1Form
            data={formData}
            onNext={(d) => { merge(d); setStep(1); }}
          />
        )}
        {step === 1 && (
          <Step2Form
            data={formData}
            onNext={(d) => { merge(d); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <Step3Form
            data={formData}
            onNext={(d) => { merge(d); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step4Form
            data={formData}
            onNext={(d) => { merge(d); setStep(4); }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ReviewStep
            data={formData}
            onBack={() => setStep(3)}
            onSubmit={() => setSubmitted(true)}
          />
        )}
      </div>
    </div>
  );
}
