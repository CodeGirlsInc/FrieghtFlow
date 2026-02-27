'use client';

import { ShipmentStatusHistory, ShipmentStatus } from '../../types/shipment.types';
import { cn } from '../../lib/utils';

const STATUS_ICON: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: '○',
  [ShipmentStatus.ACCEPTED]: '✓',
  [ShipmentStatus.IN_TRANSIT]: '→',
  [ShipmentStatus.DELIVERED]: '↓',
  [ShipmentStatus.COMPLETED]: '★',
  [ShipmentStatus.CANCELLED]: '✕',
  [ShipmentStatus.DISPUTED]: '!',
};

const STATUS_COLOR: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'bg-yellow-400',
  [ShipmentStatus.ACCEPTED]: 'bg-blue-400',
  [ShipmentStatus.IN_TRANSIT]: 'bg-indigo-400',
  [ShipmentStatus.DELIVERED]: 'bg-teal-400',
  [ShipmentStatus.COMPLETED]: 'bg-green-500',
  [ShipmentStatus.CANCELLED]: 'bg-gray-400',
  [ShipmentStatus.DISPUTED]: 'bg-red-500',
};

function StatusLabel(status: ShipmentStatus): string {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

interface StatusTimelineProps {
  history: ShipmentStatusHistory[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No history yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3">
      {history.map((entry) => (
        <li key={entry.id} className="mb-6 ml-6">
          {/* Dot */}
          <span
            className={cn(
              'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold',
              STATUS_COLOR[entry.toStatus] ?? 'bg-gray-400',
            )}
          >
            {STATUS_ICON[entry.toStatus] ?? '?'}
          </span>

          <div>
            <p className="font-medium text-foreground text-sm">
              {StatusLabel(entry.toStatus)}
            </p>
            <time className="text-xs text-muted-foreground">
              {new Date(entry.changedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {entry.changedBy?.firstName} {entry.changedBy?.lastName}
            </p>
            {entry.reason && (
              <p className="mt-1 text-sm text-muted-foreground italic">
                &ldquo;{entry.reason}&rdquo;
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
