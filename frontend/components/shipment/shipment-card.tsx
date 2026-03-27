'use client';

import Link from 'next/link';
import { Shipment } from '../../types/shipment.types';
import { StatusBadge } from './status-badge';
import { Card, CardContent, CardHeader } from '../ui/card';

interface ShipmentCardProps {
  shipment: Shipment;
  showActions?: boolean;
}

export function ShipmentCard({ shipment }: ShipmentCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: shipment.currency || 'USD',
  }).format(Number(shipment.price));

  return (
    <Link href={`/shipments/${shipment.id}`} className="block group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono">
                {shipment.trackingNumber}
              </p>
              <p className="font-semibold text-foreground truncate mt-0.5">
                {shipment.origin} → {shipment.destination}
              </p>
            </div>
            <StatusBadge status={shipment.status} className="shrink-0 mt-0.5" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {shipment.cargoDescription}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-3 text-muted-foreground">
              <span>{Number(shipment.weightKg).toLocaleString()} kg</span>
              {shipment.volumeCbm && (
                <span>{Number(shipment.volumeCbm)} m³</span>
              )}
            </div>
            <span className="font-semibold text-foreground">{formattedPrice}</span>
          </div>
          {shipment.estimatedDeliveryDate && (
            <p className="text-xs text-muted-foreground mt-2">
              ETA:{' '}
              {new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
