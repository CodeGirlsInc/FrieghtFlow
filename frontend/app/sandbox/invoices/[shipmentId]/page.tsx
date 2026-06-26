'use client';

import { use } from 'react';

interface CostLine { label: string; amount: number }

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  shipper: { name: string; address: string; email: string };
  carrier: { name: string; contact: string; vehicleId: string };
  shipment: { id: string; origin: string; destination: string; weight: string; description: string };
  costs: CostLine[];
}

const MOCK_INVOICES: Record<string, InvoiceData> = {
  'FF-00201': {
    invoiceNumber: 'INV-2026-0201',
    date: '2026-06-26',
    shipper: { name: 'Greenfield Exports Ltd.', address: '14 Marina Street, Lagos, Nigeria', email: 'billing@greenfield.ng' },
    carrier: { name: 'SwiftHaul Logistics', contact: '+234 801 000 1234', vehicleId: 'SH-TRK-441' },
    shipment: { id: 'FF-00201', origin: 'Lagos, NG', destination: 'Abuja, NG', weight: '2,400 kg', description: 'Electronics components' },
    costs: [
      { label: 'Base Rate',      amount: 480.00 },
      { label: 'Fuel Surcharge', amount: 120.00 },
      { label: 'Insurance',      amount:  72.00 },
      { label: 'Handling',       amount:  30.00 },
    ],
  },
  default: {
    invoiceNumber: 'INV-2026-0001',
    date: '2026-06-26',
    shipper: { name: 'Sample Shipper Co.', address: '1 Commerce Road, Port Harcourt, Nigeria', email: 'invoices@sampleshipper.com' },
    carrier: { name: 'Eagle Freight Co.', contact: '+234 802 555 6789', vehicleId: 'EF-TRK-117' },
    shipment: { id: 'FF-00001', origin: 'Port Harcourt, NG', destination: 'Kano, NG', weight: '1,200 kg', description: 'Industrial goods' },
    costs: [
      { label: 'Base Rate',      amount: 320.00 },
      { label: 'Fuel Surcharge', amount:  80.00 },
      { label: 'Insurance',      amount:  48.00 },
      { label: 'Handling',       amount:  20.00 },
    ],
  },
};

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function InvoicePage({ params }: { params: Promise<{ shipmentId: string }> }) {
  const { shipmentId } = use(params);
  const data = MOCK_INVOICES[shipmentId] ?? MOCK_INVOICES['default'];
  const total = data.costs.reduce((s, c) => s + c.amount, 0);

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    // Trigger browser print dialog which includes Save as PDF
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .invoice-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="no-print flex justify-end gap-3 px-6 py-4 bg-gray-100 border-b border-gray-200">
        <button
          onClick={handlePrint}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          🖨️ Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          ⬇️ Download PDF
        </button>
      </div>

      <div className="min-h-screen bg-gray-100 px-6 py-10 print:bg-white print:p-0">
        <div className="invoice-card mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* Invoice header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FreightFlow</h1>
              <p className="text-sm text-gray-500">Freight Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">{data.invoiceNumber}</p>
              <p className="text-sm text-gray-500">Date: {data.date}</p>
            </div>
          </div>

          {/* Shipper & Carrier */}
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Shipper</p>
              <p className="font-medium text-gray-900">{data.shipper.name}</p>
              <p className="text-sm text-gray-600">{data.shipper.address}</p>
              <p className="text-sm text-gray-600">{data.shipper.email}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Carrier</p>
              <p className="font-medium text-gray-900">{data.carrier.name}</p>
              <p className="text-sm text-gray-600">{data.carrier.contact}</p>
              <p className="text-sm text-gray-600">Vehicle: {data.carrier.vehicleId}</p>
            </div>
          </div>

          {/* Shipment summary */}
          <div className="mb-8 rounded-lg bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Shipment Summary</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <span className="text-gray-500">Shipment ID</span>
              <span className="font-medium text-gray-900">{data.shipment.id}</span>
              <span className="text-gray-500">Origin</span>
              <span className="font-medium text-gray-900">{data.shipment.origin}</span>
              <span className="text-gray-500">Destination</span>
              <span className="font-medium text-gray-900">{data.shipment.destination}</span>
              <span className="text-gray-500">Weight</span>
              <span className="font-medium text-gray-900">{data.shipment.weight}</span>
              <span className="text-gray-500">Description</span>
              <span className="font-medium text-gray-900">{data.shipment.description}</span>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Cost Breakdown</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 text-right font-medium">Amount (USD)</th>
                </tr>
              </thead>
              <tbody>
                {data.costs.map((c) => (
                  <tr key={c.label} className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">{c.label}</td>
                    <td className="py-2 text-right text-gray-700">{fmt(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-4 font-bold text-gray-900">Total</td>
                  <td className="pt-4 text-right text-lg font-bold text-gray-900">{fmt(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-center text-xs text-gray-400">
            Thank you for using FreightFlow. This invoice is system-generated.
          </p>
        </div>
      </div>
    </>
  );
}
