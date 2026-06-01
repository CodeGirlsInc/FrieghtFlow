'use client';

import type { Shipment } from '@/types/shipment.types';

interface Props {
  shipments: Shipment[];
  onViewDetails?: (id: string) => void;
}

export function ResponsiveShipmentList({ shipments, onViewDetails }: Props) {
  if (shipments.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No shipments found.</p>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              {['ID', 'Origin', 'Destination', 'Status', 'Weight'].map((h) => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shipments.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewDetails?.(s.id)}>
                <td className="px-4 py-3 font-mono text-xs">{s.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{s.origin}</td>
                <td className="px-4 py-3">{s.destination}</td>
                <td className="px-4 py-3 capitalize">{s.status}</td>
                <td className="px-4 py-3">{s.weight} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {shipments.map((s) => (
          <div key={s.id} className="rounded-lg border bg-white p-4 shadow-sm" onClick={() => onViewDetails?.(s.id)}>
            <p className="text-xs font-mono text-gray-400">{s.id.slice(0, 8)}</p>
            <p className="mt-1 font-medium">{s.origin} → {s.destination}</p>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span className="capitalize">{s.status}</span>
              <span>{s.weight} kg</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
