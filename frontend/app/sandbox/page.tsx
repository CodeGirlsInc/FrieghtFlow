'use client';

import { SandboxTabs } from './components/SandboxTabs';
import type { ShipmentStep } from './components/ShipmentStepper';
import type { CarrierQuote } from './components/QuoteComparisonTable';
import type { ShipmentDocument } from './components/DocumentChecklist';
import type { CostItem } from './components/CostBreakdownChart';
import { InsuranceSelectorDemo } from './components/InsuranceSelectorDemo';
import { CurrencyToggle } from './components/CurrencyToggle';
import { useCurrency } from '@/hooks/useCurrency';
import { CarrierVerificationBadge } from './components/CarrierVerificationBadge';
import { CargoTypeSelector } from './components/CargoTypeSelector';
import type { CargoType } from './components/CargoTypeSelector';
import { EmissionsCalculator } from './components/EmissionsCalculator';

const STEPPER_DEMOS: {
  title: string;
  shipmentId: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStep;
  timestamps: { [key in ShipmentStep]?: string | null };
}[] = [
  {
    title: 'Just Created',
    shipmentId: 'FF-00123',
    origin: 'Lagos, NG',
    destination: 'Abuja, NG',
    currentStatus: 'created',
    timestamps: { created: 'Apr 27, 2026 09:00 AM' },
  },
  {
    title: 'Picked Up',
    shipmentId: 'FF-00124',
    origin: 'Kano, NG',
    destination: 'Port Harcourt, NG',
    currentStatus: 'picked_up',
    timestamps: {
      created: 'Apr 27, 2026 09:00 AM',
      carrier_assigned: 'Apr 27, 2026 10:15 AM',
      picked_up: 'Apr 27, 2026 01:30 PM',
    },
  },
  {
    title: 'In Transit',
    shipmentId: 'FF-00125',
    origin: 'Ibadan, NG',
    destination: 'Enugu, NG',
    currentStatus: 'in_transit',
    timestamps: {
      created: 'Apr 26, 2026 08:00 AM',
      carrier_assigned: 'Apr 26, 2026 09:45 AM',
      picked_up: 'Apr 26, 2026 02:00 PM',
      in_transit: 'Apr 27, 2026 06:00 AM',
    },
  },
  {
    title: 'Out for Delivery',
    shipmentId: 'FF-00126',
    origin: 'Kaduna, NG',
    destination: 'Benin City, NG',
    currentStatus: 'out_for_delivery',
    timestamps: {
      created: 'Apr 24, 2026 10:00 AM',
      carrier_assigned: 'Apr 24, 2026 11:30 AM',
      picked_up: 'Apr 24, 2026 03:00 PM',
      in_transit: 'Apr 25, 2026 07:00 AM',
      at_destination_hub: 'Apr 26, 2026 11:00 PM',
      out_for_delivery: 'Apr 27, 2026 08:30 AM',
    },
  },
  {
    title: 'Delivered',
    shipmentId: 'FF-00127',
    origin: 'Aba, NG',
    destination: 'Jos, NG',
    currentStatus: 'delivered',
    timestamps: {
      created: 'Apr 22, 2026 09:00 AM',
      carrier_assigned: 'Apr 22, 2026 10:00 AM',
      picked_up: 'Apr 22, 2026 02:30 PM',
      in_transit: 'Apr 23, 2026 06:00 AM',
      at_destination_hub: 'Apr 24, 2026 09:00 PM',
      out_for_delivery: 'Apr 25, 2026 07:45 AM',
      delivered: 'Apr 25, 2026 01:15 PM',
    },
  },
];

const MOCK_QUOTES: CarrierQuote[] = [
  {
    id: 'q1',
    carrierName: 'SwiftHaul Logistics',
    rating: 4.7,
    estimatedDelivery: 'Apr 30, 2026',
    deliveryDays: 3,
    price: 245.0,
    currency: 'USD',
    insuranceIncluded: true,
  },
  {
    id: 'q2',
    carrierName: 'Eagle Freight Co.',
    rating: 4.2,
    estimatedDelivery: 'May 2, 2026',
    deliveryDays: 5,
    price: 189.5,
    currency: 'USD',
    insuranceIncluded: false,
  },
  {
    id: 'q3',
    carrierName: 'Meridian Cargo',
    rating: 4.5,
    estimatedDelivery: 'May 1, 2026',
    deliveryDays: 4,
    price: 210.0,
    currency: 'USD',
    insuranceIncluded: true,
  },
  {
    id: 'q4',
    carrierName: 'Atlas Express',
    rating: 3.9,
    estimatedDelivery: 'May 3, 2026',
    deliveryDays: 6,
    price: 175.0,
    currency: 'USD',
    insuranceIncluded: false,
  },
  {
    id: 'q5',
    carrierName: 'Horizon Shipping',
    rating: 4.8,
    estimatedDelivery: 'May 1, 2026',
    deliveryDays: 4,
    price: 225.0,
    currency: 'USD',
    insuranceIncluded: true,
  },
];

const CHECKLIST_DEMOS: { title: string; initialDocuments: ShipmentDocument[] }[] = [
  {
    title: 'All Uploaded',
    initialDocuments: [
      { type: 'bill_of_lading',        status: 'uploaded', uploadedAt: 'Apr 22, 2026 09:00 AM' },
      { type: 'commercial_invoice',    status: 'uploaded', uploadedAt: 'Apr 22, 2026 09:05 AM' },
      { type: 'packing_list',          status: 'uploaded', uploadedAt: 'Apr 22, 2026 09:10 AM' },
      { type: 'certificate_of_origin', status: 'uploaded', uploadedAt: 'Apr 22, 2026 09:15 AM' },
      { type: 'customs_declaration',   status: 'uploaded', uploadedAt: 'Apr 22, 2026 09:20 AM' },
    ],
  },
  {
    title: 'Partially Complete',
    initialDocuments: [
      { type: 'bill_of_lading',        status: 'uploaded', uploadedAt: 'Apr 25, 2026 10:30 AM' },
      { type: 'commercial_invoice',    status: 'uploaded', uploadedAt: 'Apr 25, 2026 10:35 AM' },
      { type: 'packing_list',          status: 'missing' },
      { type: 'certificate_of_origin', status: 'optional' },
      { type: 'customs_declaration',   status: 'missing' },
    ],
  },
  {
    title: 'Not Started',
    initialDocuments: [
      { type: 'bill_of_lading',        status: 'missing' },
      { type: 'commercial_invoice',    status: 'missing' },
      { type: 'packing_list',          status: 'missing' },
      { type: 'certificate_of_origin', status: 'optional' },
      { type: 'customs_declaration',   status: 'missing' },
    ],
  },
];

const COST_DEMOS: { title: string; breakdown: CostItem[]; currency?: string }[] = [
  {
    title: 'Domestic Shipment',
    breakdown: [
      { label: 'Base Rate',       amount: 180.00 },
      { label: 'Fuel Surcharge',  amount:  45.00 },
      { label: 'Insurance',       amount:  22.50 },
      { label: 'Handling',        amount:  15.00 },
    ],
  },
  {
    title: 'International Shipment',
    breakdown: [
      { label: 'Base Rate',       amount: 520.00 },
      { label: 'Fuel Surcharge',  amount: 130.00 },
      { label: 'Insurance',       amount:  78.00 },
      { label: 'Customs',         amount:  95.00 },
      { label: 'Handling',        amount:  35.00 },
    ],
  },
];

const SAMPLE_PRICES = [
  { label: 'Lagos → Abuja (Standard)', usd: 245.0 },
  { label: 'Port Harcourt → Kano (Express)', usd: 520.0 },
  { label: 'Ibadan → Enugu (Economy)', usd: 175.0 },
];

function CurrencyDemo() {
  const { format } = useCurrency();
  return (
    <ul className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {SAMPLE_PRICES.map(({ label, usd }) => (
        <li key={label} className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-gray-700">{label}</span>
          <span className="font-semibold text-gray-900">{format(usd)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SandboxPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Insurance Selector demo */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Insurance Selector</h2>
          <p className="mb-4 text-sm text-gray-500">Select a tier and enter a declared value to see the real-time premium.</p>
          <InsuranceSelectorDemo />
        </section>
        {/* Header with currency toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">Component Sandbox</h1>
            <p className="text-sm text-gray-500">FrieghtFlow UI component demos</p>
          </div>
          <CurrencyToggle />
        </div>

        {/* Currency demo section */}
        <section className="mb-10 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="mb-1 text-base font-semibold text-blue-900">Multi-Currency Price Display</h2>
          <p className="mb-3 text-sm text-blue-700">
            Use the currency selector above to switch between USD, EUR, GBP, and NGN.
            All prices below convert in real time.
          </p>
          <CurrencyDemo />
        </section>

        {/* Carrier Verification Badge demo */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-base font-semibold text-gray-900">Carrier Verification Badge</h2>
          <p className="mb-4 text-sm text-gray-500">Hover each badge to see carrier details.</p>
          <div className="flex flex-wrap gap-4">
            <CarrierVerificationBadge score={10}  deliveries={3}    memberSince="Jun 2026" />
            <CarrierVerificationBadge score={55}  deliveries={120}  memberSince="Jan 2025" />
            <CarrierVerificationBadge score={78}  deliveries={540}  memberSince="Mar 2024" />
            <CarrierVerificationBadge score={95}  deliveries={1800} memberSince="Sep 2022" />
          </div>
        </section>

        {/* Emissions Calculator demo */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-base font-semibold text-gray-900">CO₂ Emissions Calculator</h2>
          <p className="mb-4 text-sm text-gray-500">Estimate the carbon footprint of a shipment.</p>
          <EmissionsCalculator />
        </section>

        <SandboxTabs
          stepperDemos={STEPPER_DEMOS}
          quotes={MOCK_QUOTES}
          checklistDemos={CHECKLIST_DEMOS}
          costDemos={COST_DEMOS}
        />
      </div>
    </main>
  );
}
