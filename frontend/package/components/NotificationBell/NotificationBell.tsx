'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotificationStore, type ShipmentNotification } from '@/stores/notification.store';

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

const EVENT_ICONS: Record<string, string> = {
  'shipment:created': '📦',
  'shipment:accepted': '✅',
  'shipment:in_transit': '🚛',
  'shipment:delivered': '📬',
  'shipment:completed': '🎉',
  'shipment:cancelled': '❌',
  'shipment:disputed': '⚠️',
  'shipment:dispute_resolved': '🛡️',
};

const EVENT_COLORS: Record<string, string> = {
  'shipment:disputed': 'text-red-600',
  'shipment:cancelled': 'text-red-600',
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

function NotificationItem({ n }: { n: ShipmentNotification }) {
  const label = EVENT_LABELS[n.event] ?? 'Updated';
  const icon = EVENT_ICONS[n.event] ?? '🔔';
  const color = EVENT_COLORS[n.event] ?? 'text-foreground';

  return (
    <Link
      href={`/shipments/${n.shipmentId}`}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors ${
        !n.read ? 'bg-primary/5' : ''
      }`}
    >
      <span className="text-lg shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${color}`}>{label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {n.trackingNumber} · {n.origin} → {n.destination}
        </p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
        {timeAgo(n.updatedAt)}
      </span>
    </Link>
  );
}

export interface NotificationBellProps {
  maxDisplay?: number;
}

export function NotificationBell({ maxDisplay = 10 }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearAll } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and Escape key
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) markAllRead();
  };

  const displayedNotifications = notifications.slice(0, maxDisplay);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Notifications</p>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {displayedNotifications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No notifications yet.
              </p>
            ) : (
              displayedNotifications.map((n) => (
                <NotificationItem key={n.id} n={n} />
              ))
            )}
          </div>

          {notifications.length > maxDisplay && (
            <div className="border-t border-border px-4 py-2">
              <p className="text-xs text-center text-muted-foreground">
                +{notifications.length - maxDisplay} more notification
                {notifications.length - maxDisplay !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
