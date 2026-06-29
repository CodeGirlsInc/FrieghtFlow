// #1005 – Carrier discovery card for browse-carriers page
import Link from 'next/link';

export interface CarrierSummary {
  id: string;
  companyName: string;
  truckTypes: string[];
  serviceAreas: string[];
  rating: number;
  totalShipments: number;
  verified: boolean;
}
{
// //   const { currency, setCurrency, convert, format } = useCurrencyStore();
// //   return { currency, setCurrency, convert, format };
// // }

export function CarrierCard({ carrier }: { carrier: CarrierSummary }) {
  return (
    <div className="rounded-lg border p-4 space-y-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{carrier.companyName}</h3>
          {carrier.verified && <span className="text-xs text-green-600 font-medium">Verified</span>}
        </div>
        <span className="text-sm font-bold text-yellow-500">{carrier.rating.toFixed(1)}</span>
      </div>
      <p className="text-xs text-gray-500">Trucks: {carrier.truckTypes.join(', ')}</p>
      <p className="text-xs text-gray-500">Areas: {carrier.serviceAreas.join(', ')}</p>
      <p className="text-xs text-gray-400">{carrier.totalShipments} shipments</p>
      <Link href={`/carriers/${carrier.id}`} className="block text-center text-sm text-blue-600 underline mt-1">View Profile</Link>
    </div>
  );
}
