'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

// ─── HS Code mock list ────────────────────────────────────────────────────────
const HS_CODES = [
  { code: '8471.30', desc: 'Portable digital automatic data processing machines' },
  { code: '6203.42', desc: 'Trousers, bib and brace, breeches and shorts — of cotton' },
  { code: '8517.12', desc: 'Telephones for cellular networks (mobile phones)' },
  { code: '8703.23', desc: 'Motor cars — spark-ignition, 1500-3000cc' },
  { code: '0901.11', desc: 'Coffee, not roasted, not decaffeinated' },
  { code: '7208.51', desc: 'Flat-rolled products of iron, hot-rolled, ≥ 4.75 mm thick' },
  { code: '3004.90', desc: 'Medicaments for retail sale, other' },
  { code: '9403.20', desc: 'Other metal furniture' },
];

const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DDP', 'DAP'] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  exporterName:    z.string().min(2, 'Required'),
  exporterAddress: z.string().min(5, 'Required'),
  exporterCountry: z.string().min(2, 'Required'),
  importerName:    z.string().min(2, 'Required'),
  importerAddress: z.string().min(5, 'Required'),
  importerCountry: z.string().min(2, 'Required'),
  goodsDescription: z.string().min(5, 'Required'),
  hsCode:          z.string().min(4, 'Select or enter an HS code'),
  declaredValue:   z.coerce.number().positive('Must be > 0'),
  currency:        z.string().min(1, 'Required'),
  incoterm:        z.enum(INCOTERMS, { error: 'Select an Incoterm' }),
});

type FormValues = z.infer<typeof schema>;

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
        error
          ? 'border-red-400 focus:ring-red-200'
          : 'border-gray-200 focus:ring-indigo-200'
      }`}
    />
  );
}

// ─── HS Code autocomplete ──────────────────────────────────────────────────────
function HsCodeField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = query.length >= 2
    ? HS_CODES.filter(
        (h) =>
          h.code.includes(query) ||
          h.desc.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search HS code or description…"
        error={!!error}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((h) => (
            <li
              key={h.code}
              onMouseDown={() => {
                onChange(h.code);
                setQuery(`${h.code} — ${h.desc}`);
                setOpen(false);
              }}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
            >
              <span className="font-mono font-medium">{h.code}</span>
              <span className="ml-2 text-gray-500">{h.desc}</span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CustomsDeclarationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as any });

  const onSubmit = (data: FormValues) => {
    console.log('Submit', data);
    setSubmitted(true);
  };

  const onDraft = () => {
    console.log('Draft', getValues());
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-xl border border-green-200 bg-green-50 px-10 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-green-800">Declaration Submitted ✓</p>
          <p className="mt-1 text-sm text-green-600">Your customs declaration has been submitted.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm text-indigo-600 underline"
          >
            New declaration
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Customs Declaration</h1>
        <p className="mb-8 text-sm text-gray-500">Complete all sections for international shipment clearance.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

          {/* Exporter */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Exporter Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.exporterName?.message}>
                <Input {...register('exporterName')} error={!!errors.exporterName} placeholder="Exporter name" />
              </Field>
              <Field label="Country" error={errors.exporterCountry?.message}>
                <Input {...register('exporterCountry')} error={!!errors.exporterCountry} placeholder="e.g. Nigeria" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address" error={errors.exporterAddress?.message}>
                  <Input {...register('exporterAddress')} error={!!errors.exporterAddress} placeholder="Full address" />
                </Field>
              </div>
            </div>
          </section>

          {/* Importer */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Importer Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.importerName?.message}>
                <Input {...register('importerName')} error={!!errors.importerName} placeholder="Importer name" />
              </Field>
              <Field label="Country" error={errors.importerCountry?.message}>
                <Input {...register('importerCountry')} error={!!errors.importerCountry} placeholder="e.g. Germany" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address" error={errors.importerAddress?.message}>
                  <Input {...register('importerAddress')} error={!!errors.importerAddress} placeholder="Full address" />
                </Field>
              </div>
            </div>
          </section>

          {/* Goods */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Goods Description</h2>
            <div className="space-y-4">
              <Field label="Description" error={errors.goodsDescription?.message}>
                <textarea
                  {...register('goodsDescription')}
                  rows={3}
                  placeholder="Describe the goods being shipped…"
                  className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.goodsDescription
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-indigo-200'
                  }`}
                />
              </Field>
              <Field label="HS Code" error={errors.hsCode?.message}>
                <Controller
                  name="hsCode"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <HsCodeField value={field.value} onChange={field.onChange} error={errors.hsCode?.message} />
                  )}
                />
              </Field>
            </div>
          </section>

          {/* Value & Incoterms */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Value &amp; Incoterms</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Declared Value" error={errors.declaredValue?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('declaredValue')}
                  error={!!errors.declaredValue}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Currency" error={errors.currency?.message}>
                <Input {...register('currency')} error={!!errors.currency} placeholder="USD" />
              </Field>
              <Field label="Incoterm" error={errors.incoterm?.message}>
                <select
                  {...register('incoterm')}
                  defaultValue=""
                  className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    errors.incoterm
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-indigo-200'
                  }`}
                >
                  <option value="" disabled>Select…</option>
                  {INCOTERMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDraft}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              {savedDraft ? 'Draft Saved ✓' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Submit Declaration
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
