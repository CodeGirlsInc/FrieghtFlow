'use client';

import { useState } from 'react';
import { useNotificationStore, type ShipmentNotification } from '../../stores/notification.store';
import { cn } from '@/lib/utils';
import { ShipmentStatus } from '@/types/shipment.types';

// Human-readable status labels
const getStatusLabel = (status: ShipmentStatus): string => {
  const labels: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'Pending',
    [ShipmentStatus.ACCEPTED]: 'Accepted',
    [ShipmentStatus.IN_TRANSIT]: 'In Transit',
    [ShipmentStatus.DELIVERED]: 'Delivered',
    [ShipmentStatus.COMPLETED]: 'Completed',
    [ShipmentStatus.CANCELLED]: 'Cancelled',
    [ShipmentStatus.DISPUTED]: 'Disputed',
  };
  return labels[status] || status;
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications yet
                </div>
              ) : (
                <ul className="divide-y">
                  {notifications.slice(0, 20).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: ShipmentNotification }) {
  const statusColor = {
    [ShipmentStatus.PENDING]: 'bg-yellow-500',
    [ShipmentStatus.ACCEPTED]: 'bg-blue-500',
    [ShipmentStatus.IN_TRANSIT]: 'bg-orange-500',
    [ShipmentStatus.DELIVERED]: 'bg-green-500',
    [ShipmentStatus.COMPLETED]: 'bg-green-700',
    [ShipmentStatus.CANCELLED]: 'bg-red-500',
    [ShipmentStatus.DISPUTED]: 'bg-red-700',
  }[notification.status] || 'bg-gray-500';

  return (
    <li className={cn('p-3 hover:bg-accent/50 transition-colors', !notification.read && 'bg-primary/5')}>
      <div className="flex items-start gap-3">
        <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', statusColor)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {getStatusLabel(notification.status)}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {notification.origin} → {notification.destination}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {notification.trackingNumber}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(notification.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
