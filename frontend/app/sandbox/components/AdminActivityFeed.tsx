'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventType =
  | 'user_registered'
  | 'shipment_created'
  | 'dispute_filed'
  | 'payment_processed'
  | 'carrier_verified';

export interface ActivityEvent {
  id: string;
  type: EventType;
  description: string;
  actor: string;
  timestamp: Date;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const EVENT_META: Record<
  EventType,
  { label: string; icon: string; color: string }
> = {
  user_registered:    { label: 'User Registered',    icon: '👤', color: 'bg-blue-100 text-blue-700'    },
  shipment_created:   { label: 'Shipment Created',   icon: '📦', color: 'bg-green-100 text-green-700'  },
  dispute_filed:      { label: 'Dispute Filed',      icon: '⚠️', color: 'bg-red-100 text-red-700'      },
  payment_processed:  { label: 'Payment Processed',  icon: '💳', color: 'bg-purple-100 text-purple-700' },
  carrier_verified:   { label: 'Carrier Verified',   icon: '✅', color: 'bg-teal-100 text-teal-700'    },
};

const ALL_TYPES = Object.keys(EVENT_META) as EventType[];

// ── Relative time ─────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminActivityFeedProps {
  /** Async function that fetches events. Receives offset for load-more. */
  fetchEvents: (offset: number) => Promise<ActivityEvent[]>;
  pageSize?: number;
  /** Interval in ms between auto-refreshes. Defaults to 30 000. */
  refreshInterval?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminActivityFeed({
  fetchEvents,
  pageSize = 10,
  refreshInterval = 30_000,
}: AdminActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (nextOffset: number, replace: boolean) => {
      setLoading(true);
      try {
        const data = await fetchEvents(nextOffset);
        setHasMore(data.length >= pageSize);
        setEvents((prev) => (replace ? data : [...prev, ...data]));
        setOffset(nextOffset + data.length);
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents, pageSize],
  );

  // Initial load
  useEffect(() => {
    void load(0, true);
  }, [load]);

  // Auto-refresh: reload from top every `refreshInterval` ms
  useEffect(() => {
    const id = setInterval(() => void load(0, true), refreshInterval);
    return () => clearInterval(id);
  }, [load, refreshInterval]);

  const visible = filter === 'all' ? events : events.filter((e) => e.type === filter);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {ALL_TYPES.map((t) => (
          <FilterChip
            key={t}
            label={EVENT_META[t].label}
            active={filter === t}
            onClick={() => setFilter(t)}
          />
        ))}
      </div>

      {/* Feed list */}
      <ul className="flex flex-col gap-2" role="feed" aria-label="Admin activity feed">
        {visible.length === 0 && !loading && (
          <li className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
            No activity events.
          </li>
        )}
        {visible.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </ul>

      {/* Load more */}
      {hasMore && filter === 'all' && (
        <button
          onClick={() => void load(offset, false)}
          disabled={loading}
          className="mx-auto rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EventRow({ event }: { event: ActivityEvent }) {
  const meta = EVENT_META[event.type];
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <span
        className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg', meta.color)}
        aria-hidden="true"
      >
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', meta.color)}>
            {meta.label}
          </span>
          <time
            dateTime={event.timestamp.toISOString()}
            className="shrink-0 text-xs text-gray-400"
            title={event.timestamp.toLocaleString()}
          >
            {relativeTime(event.timestamp)}
          </time>
        </div>
        <p className="mt-1 truncate text-sm text-gray-700">{event.description}</p>
        <p className="mt-0.5 text-xs text-gray-400">by {event.actor}</p>
      </div>
    </li>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500',
      )}
    >
      {label}
    </button>
  );
}
