'use client';

export type CargoType = 'General' | 'Refrigerated' | 'Hazmat';

export interface CargoRate {
  type: CargoType;
  baseRatePerKg: number;
  minimumCharge: number;
}

export interface RouteRate {
  origin: string;
  destination: string;
  surchargeMultiplier: number; // e.g. 1.15 = +15%
}

export interface RateStructure {
  carrierName: string;
  currency: string;
  fuelSurchargePercent: number;
  handlingFee: number;
  validFrom: string; // ISO date
  validTo: string;   // ISO date
  cargoRates: CargoRate[];
  routeRates?: RouteRate[];
}

interface RateCardProps {
  rates: RateStructure;
}

const CARGO_ICONS: Record<CargoType, string> = {
  General: '📦',
  Refrigerated: '🧊',
  Hazmat: '☢️',
};

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function RateCard({ rates }: RateCardProps) {
  const { carrierName, currency, fuelSurchargePercent, handlingFee, validFrom, validTo, cargoRates, routeRates } = rates;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{carrierName}</h2>
          <p className="text-xs text-blue-200">Rate Card · {currency}</p>
        </div>
        <div className="text-right text-xs text-blue-200">
          <p>Valid from {fmtDate(validFrom)}</p>
          <p>to {fmtDate(validTo)}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Global charges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">Fuel Surcharge</p>
            <p className="text-xl font-bold text-gray-900">{fuelSurchargePercent}%</p>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">Handling Fee</p>
            <p className="text-xl font-bold text-gray-900">{fmt(handlingFee, currency)}</p>
          </div>
        </div>

        {/* Cargo type rates */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Rates by Cargo Type</h3>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">
              <span>Type</span>
              <span className="text-right">Base / kg</span>
              <span className="text-right">Min. Charge</span>
            </div>
            {cargoRates.map((r) => (
              <div key={r.type} className="grid grid-cols-3 px-4 py-3 text-sm">
                <span className="flex items-center gap-1.5">
                  {CARGO_ICONS[r.type]} {r.type}
                </span>
                <span className="text-right font-medium text-gray-900">{fmt(r.baseRatePerKg, currency)}</span>
                <span className="text-right text-gray-600">{fmt(r.minimumCharge, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route-specific rates */}
        {routeRates && routeRates.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Route-Specific Adjustments</h3>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500">
                <span>Origin</span>
                <span>Destination</span>
                <span className="text-right">Surcharge</span>
              </div>
              {routeRates.map((r, i) => (
                <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm">
                  <span className="text-gray-700">{r.origin}</span>
                  <span className="text-gray-700">{r.destination}</span>
                  <span className="text-right font-medium text-orange-600">
                    +{((r.surchargeMultiplier - 1) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          Request Custom Quote
        </button>
      </div>
    </div>
  );
}
