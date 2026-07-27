'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotificationStore, ShipmentNotification } from '../../../stores/notification.store';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const EVENT_LABELS: Record<string, string> = {
  'shipment:created': 'Created',
  'shipment:accepted': 'Accepted',
  'shipment:in_transit': 'In Transit',
  'shipment:delivered': 'Delivered',
  'shipment:completed': 'Completed',
  'shipment:cancelled': 'Cancelled',
  'shipment:disputed': 'Disputed',
  'shipment:dispute_resolved': 'Dispute Resolved',
};

const EVENT_COLORS: Record<string, string> = {
  'shipment:disputed': 'text-destructive',
  'shipment:cancelled': 'text-destructive',
  'shipment:completed': 'text-green-600',
  'shipment:dispute_resolved': 'text-green-600',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
              filter === f
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? 'No unread notifications.'
                  : filter === 'read'
                    ? 'No read notifications.'
                    : 'No notifications yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((n) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationRow({ n }: { n: ShipmentNotification }) {
  const label = EVENT_LABELS[n.event] ?? 'Updated';
  const color = EVENT_COLORS[n.event] ?? 'text-foreground';

  return (
    <Link
      href={`/shipments/${n.shipmentId}`}
      className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent transition-colors ${
        !n.read ? 'bg-primary/5' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${color}`}>{label}</span>
          {!n.read && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" aria-label="Unread" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {n.trackingNumber} · {n.origin} → {n.destination}
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
        {timeAgo(n.updatedAt)}
      </span>
    </Link>
  );
}
