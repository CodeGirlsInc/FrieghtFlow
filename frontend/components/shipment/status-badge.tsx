'use client';

import { ShipmentStatus } from '../../types/shipment.types';
import { cn } from '../../lib/utils';

const STATUS_CONFIG: Record<
  ShipmentStatus,
  { label: string; className: string }
> = {
  [ShipmentStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  [ShipmentStatus.ACCEPTED]: {
    label: 'Accepted',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  [ShipmentStatus.IN_TRANSIT]: {
    label: 'In Transit',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  [ShipmentStatus.DELIVERED]: {
    label: 'Delivered',
    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  },
  [ShipmentStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  [ShipmentStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  [ShipmentStatus.DISPUTED]: {
    label: 'Disputed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

interface StatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
