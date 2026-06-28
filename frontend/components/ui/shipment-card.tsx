'use client';

import { Skeleton } from '@/components/ui/skeleton';

export type ShipmentStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  price: number;
  currency: string;
}

interface ShipmentCardProps {
  shipment?: Shipment;
  isLoading?: boolean;
  onSelect?: (id: string) => void;
}

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; classes: string }> = {
  PENDING: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Accepted', classes: 'bg-blue-100 text-blue-800' },
  IN_TRANSIT: { label: 'In Transit', classes: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Delivered', classes: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-700' },
  DISPUTED: { label: 'Disputed', classes: 'bg-red-100 text-red-800' },
};

export function ShipmentCard({ shipment, isLoading = false, onSelect }: ShipmentCardProps) {
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading shipment"
        className="rounded-lg border border-gray-200 bg-white p-4 space-y-3"
      >
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!shipment) return null;

  const statusConfig = STATUS_CONFIG[shipment.status];
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: shipment.currency || 'USD',
  }).format(shipment.price);

  return (
    <article
      aria-label={`Shipment ${shipment.trackingNumber}`}
      className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
      onClick={() => onSelect?.(shipment.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Tracking number
          </p>
          <p
            data-testid="tracking-number"
            className="text-sm font-semibold text-gray-900 truncate"
          >
            {shipment.trackingNumber}
          </p>
        </div>

        {/* Status badge — color + text (never color alone) */}
        <span
          data-testid="status-badge"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.classes}`}
        >
          {/* Screen reader prefix for unambiguous status */}
          <span className="sr-only">Status: </span>
          {statusConfig.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <span data-testid="origin" className="truncate">
          {shipment.origin}
        </span>
        <span aria-hidden="true">→</span>
        <span aria-label="to" className="sr-only">
          to
        </span>
        <span data-testid="destination" className="truncate">
          {shipment.destination}
        </span>
      </div>

      <div className="mt-3 text-right">
        <span
          data-testid="price"
          aria-label={`Price: ${formattedPrice}`}
          className="text-base font-semibold text-gray-900"
        >
          {formattedPrice}
        </span>
      </div>

      {/* Hidden click target for keyboard users */}
      <button
        type="button"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(shipment.id);
        }}
      >
        View shipment {shipment.trackingNumber}
      </button>
    </article>
  );
}