'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/shipment/status-badge';
import type { Shipment } from '@/types/shipment.types';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-700' },
  in_transit: { label: 'In Transit', className: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', className: 'bg-teal-100 text-teal-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  disputed: { label: 'Disputed', className: 'bg-red-100 text-red-700' },
};

export interface ShipmentCardProps {
  shipment: Shipment;
  onViewDetails?: (id: string) => void;
}

export function ShipmentCard({ shipment, onViewDetails }: ShipmentCardProps) {
  const statusConfig = STATUS_STYLES[shipment.status] ?? {
    label: shipment.status,
    className: 'bg-gray-100 text-gray-600',
  };

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: shipment.currency || 'USD',
  }).format(Number(shipment.price));

  const createdDate = shipment.createdAt
    ? new Date(shipment.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-mono truncate">
              {shipment.trackingNumber}
            </p>
            <p className="font-semibold text-foreground truncate mt-0.5">
              {shipment.origin} → {shipment.destination}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {shipment.cargoDescription || 'No description'}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-3 text-muted-foreground">
            {shipment.weightKg != null && (
              <span>{Number(shipment.weightKg).toLocaleString()} kg</span>
            )}
            {shipment.volumeCbm && (
              <span>{Number(shipment.volumeCbm)} m³</span>
            )}
          </div>
          <span className="font-semibold text-foreground">{formattedPrice}</span>
        </div>
        {createdDate && (
          <p className="text-xs text-muted-foreground mt-2">{createdDate}</p>
        )}
        {onViewDetails && (
          <div className="mt-3 pt-3 border-t border-border">
            <button
              onClick={(e) => {
                e.preventDefault();
                onViewDetails(shipment.id);
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View Details →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
