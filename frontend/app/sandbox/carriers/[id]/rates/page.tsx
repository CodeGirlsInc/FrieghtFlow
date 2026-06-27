'use client';

import { RateCard, type RateStructure } from '../../../components/RateCard';

const MOCK_RATES: RateStructure = {
  carrierName: 'SwiftHaul Logistics',
  currency: 'USD',
  fuelSurchargePercent: 8.5,
  handlingFee: 45,
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  cargoRates: [
    { type: 'General',      baseRatePerKg: 0.85, minimumCharge: 120 },
    { type: 'Refrigerated', baseRatePerKg: 1.45, minimumCharge: 200 },
    { type: 'Hazmat',       baseRatePerKg: 2.10, minimumCharge: 350 },
  ],
  routeRates: [
    { origin: 'Lagos',   destination: 'Abuja',        surchargeMultiplier: 1.05 },
    { origin: 'Kano',    destination: 'Port Harcourt', surchargeMultiplier: 1.12 },
    { origin: 'Enugu',   destination: 'Lagos',         surchargeMultiplier: 1.08 },
  ],
};

export default function CarrierRatesPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Carrier Rate Card</h1>
      <RateCard rates={MOCK_RATES} />
    </main>
  );
}
