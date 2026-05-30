'use client';

import { cn } from '@/lib/utils';
import type { ShipmentStatusHistory, ShipmentStatus } from '@/types/shipment.types';

interface TimelineStep {
  status: ShipmentStatus;
  label: string;
  timestamp?: string | null;
  actor?: string;
  reason?: string | null;
}

const STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: 'pending' as ShipmentStatus, label: 'Created' },
  { status: 'accepted' as ShipmentStatus, label: 'Accepted' },
  { status: 'in_transit' as ShipmentStatus, label: 'In Transit' },
  { status: 'delivered' as ShipmentStatus, label: 'Delivered' },
  { status: 'completed' as ShipmentStatus, label: 'Completed' },
];

const TERMINAL_STATUSES: ShipmentStatus[] = [
  'cancelled' as ShipmentStatus,
  'disputed' as ShipmentStatus,
];

export interface ShipmentTimelineProps {
  history: ShipmentStatusHistory[];
  currentStatus?: ShipmentStatus | null;
}

export function ShipmentTimeline({ history, currentStatus }: ShipmentTimelineProps) {
  const isTerminal = currentStatus && TERMINAL_STATUSES.includes(currentStatus);

  // Build steps from history
  const completedStatuses = new Set(history.map((h) => h.toStatus));
  const lastCompleted = history.length > 0 ? history[history.length - 1] : null;

  // If terminal, show a special indicator
  if (isTerminal && currentStatus) {
    const terminalLabel =
      currentStatus === 'cancelled' ? 'Cancelled' : 'Disputed';
    const terminalColor =
      currentStatus === 'cancelled'
        ? 'bg-amber-500'
        : 'bg-red-500';

    return (
      <div className="space-y-2" role="list" aria-label="Shipment timeline">
        <ol className="relative border-l border-border ml-3">
          {history.map((entry) => (
            <li key={entry.id} className="mb-6 ml-6" role="listitem">
              <span
                className={cn(
                  'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold transition-all duration-300',
                  entry.toStatus === 'disputed'
                    ? 'bg-red-500'
                    : entry.toStatus === 'cancelled'
                      ? 'bg-amber-500'
                      : 'bg-green-500',
                )}
                aria-hidden="true"
              >
                {entry.toStatus === 'disputed' ? '!' : entry.toStatus === 'cancelled' ? '✕' : '✓'}
              </span>
              <p className="font-medium text-foreground text-sm">
                {entry.toStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
              {entry.reason && (
                <p className="mt-1 text-sm text-muted-foreground italic">
                  &ldquo;{entry.reason}&rdquo;
                </p>
              )}
            </li>
          ))}
          <li className="ml-6" role="listitem">
            <span
              className={cn(
                'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold animate-pulse',
                terminalColor,
              )}
              aria-hidden="true"
            >
              {currentStatus === 'cancelled' ? '✕' : '!'}
            </span>
            <p className="font-medium text-foreground text-sm">
              {terminalLabel}
            </p>
            {lastCompleted?.changedAt && (
              <time className="text-xs text-muted-foreground">
                {new Date(lastCompleted.changedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            )}
          </li>
        </ol>
      </div>
    );
  }

  // Determine current step index
  const currentIndex = currentStatus
    ? STEPS.findIndex((s) => s.status === currentStatus)
    : -1;

  return (
    <div className="space-y-2" role="list" aria-label="Shipment timeline">
      <ol className="relative border-l border-border ml-3">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const historyEntry = history.find((h) => h.toStatus === step.status);

          return (
            <li key={step.status} className="mb-6 ml-6" role="listitem">
              <span
                className={cn(
                  'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold transition-all duration-300',
                  isCompleted && 'bg-green-500',
                  isCurrent && 'bg-blue-500 animate-pulse',
                  !isCompleted && !isCurrent && 'border-2 border-gray-300 bg-white text-gray-400',
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-hidden="true"
              >
                {isCompleted ? '✓' : isCurrent ? '●' : '○'}
              </span>
              <div>
                <p
                  className={cn(
                    'text-sm transition-colors duration-300',
                    isCompleted && 'font-medium text-green-700',
                    isCurrent && 'font-semibold text-blue-700',
                    !isCompleted && !isCurrent && 'text-gray-400',
                  )}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                      Active
                    </span>
                  )}
                </p>
                {historyEntry && (
                  <>
                    <time className="text-xs text-muted-foreground">
                      {new Date(historyEntry.changedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    {historyEntry.changedBy && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {historyEntry.changedBy.firstName} {historyEntry.changedBy.lastName}
                      </p>
                    )}
                  </>
                )}
                {historyEntry?.reason && (
                  <p className="mt-1 text-sm text-muted-foreground italic">
                    &ldquo;{historyEntry.reason}&rdquo;
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
