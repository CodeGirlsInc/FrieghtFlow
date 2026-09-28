'use client';

import { cn } from '../../lib/utils';
import { ShipmentCard } from './shipment-card';
import type { Shipment } from '../../types/shipment.types';

/**
 * The single definition of the shipment list grid. Every page that lays
 * `ShipmentCard`s out in a grid uses this so the breakpoints cannot drift
 * apart again (the Marketplace and My Shipments lists used to disagree).
 * Exported for the loading-state skeletons, which must match it exactly.
 */
export const shipmentListGridClasses = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

interface ShipmentCardGridProps {
  shipments: Shipment[];
  /** Accessible name for the list, e.g. "Available shipments". */
  label: string;
  className?: string;
}

export function ShipmentCardGrid({ shipments, label, className }: ShipmentCardGridProps) {
  return (
    <ul aria-label={label} className={cn(shipmentListGridClasses, className)}>
      {shipments.map((shipment) => (
        <li key={shipment.id}>
          <ShipmentCard shipment={shipment} />
        </li>
      ))}
    </ul>
  );
}
