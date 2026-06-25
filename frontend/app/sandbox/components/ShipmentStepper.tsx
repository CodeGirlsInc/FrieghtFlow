'use client';

import {
  Check,
  ClipboardList,
  UserCheck,
  Package,
  Truck,
  Warehouse,
  MapPin,
  PackageCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ShipmentStep =
  | 'created'
  | 'carrier_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'at_destination_hub'
  | 'out_for_delivery'
  | 'delivered';

const STEPS: { key: ShipmentStep; label: string; icon: LucideIcon }[] = [
  { key: 'created',            label: 'Created',             icon: ClipboardList },
  { key: 'carrier_assigned',   label: 'Carrier Assigned',    icon: UserCheck     },
  { key: 'picked_up',          label: 'Picked Up',           icon: Package       },
  { key: 'in_transit',         label: 'In Transit',          icon: Truck         },
  { key: 'at_destination_hub', label: 'At Destination Hub',  icon: Warehouse     },
  { key: 'out_for_delivery',   label: 'Out for Delivery',    icon: MapPin        },
  { key: 'delivered',          label: 'Delivered',           icon: PackageCheck  },
];

export interface ShipmentStepperProps {
  currentStatus: ShipmentStep;
  timestamps?: { [key in ShipmentStep]?: string | null };
}

export function ShipmentStepper({ currentStatus, timestamps = {} }: ShipmentStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const completedCount = currentIndex;

  return (
    <div>
      <p className="mb-4 text-xs text-gray-400">
        {completedCount === STEPS.length - 1
          ? 'All steps completed'
          : `${completedCount} of ${STEPS.length} steps completed`}
      </p>

      <ol aria-label="Shipment timeline" className="flex flex-col">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent   = i === currentIndex;
          const isLast      = i === STEPS.length - 1;
          const timestamp   = timestamps[step.key];
          const Icon        = step.icon;

          return (
            <li key={step.key} className="flex gap-3">
              {/* icon column */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                    isCompleted && 'bg-green-500',
                    isCurrent   && 'bg-blue-500',
                    !isCompleted && !isCurrent && 'border-2 border-gray-200 bg-gray-50',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted && (
                    <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                  )}
                  {isCurrent && (
                    <>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                      <Icon className="relative h-4 w-4 text-white" strokeWidth={2} />
                    </>
                  )}
                  {!isCompleted && !isCurrent && (
                    <Icon className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={cn(
                      'my-1 w-0.5 flex-1',
                      isCompleted ? 'bg-green-400' : 'bg-gray-200',
                    )}
                    style={{ minHeight: '1.5rem' }}
                  />
                )}
              </div>

              {/* label column */}
              <div className={cn('pb-7 pt-1.5', isLast && 'pb-0')}>
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-sm leading-none',
                      isCompleted              && 'font-medium text-green-700',
                      isCurrent               && 'font-semibold text-gray-900',
                      !isCompleted && !isCurrent && 'font-normal text-gray-400',
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                      Active
                    </span>
                  )}
                </div>
                {timestamp && (
                  <p className="mt-1 text-xs text-gray-400">{timestamp}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
