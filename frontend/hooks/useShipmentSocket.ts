'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useNotificationStore, type ShipmentNotification } from '../stores/notification.store';
import { getAccessToken } from '../lib/api/client';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { toast } from 'sonner';
import { ShipmentStatus } from '../types/shipment.types';

// Standard status transitions that warrant a toast notification
const STANDARD_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.PENDING,
  ShipmentStatus.ACCEPTED,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.DELIVERED,
];

interface ShipmentUpdatedPayload {
  event: string;
  shipmentId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  updatedAt: string;
}

// Helper to get human-readable status message
const getStatusMessage = (status: ShipmentStatus): string => {
  const messages: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'Shipment created - awaiting carrier',
    [ShipmentStatus.ACCEPTED]: 'Shipment accepted by carrier',
    [ShipmentStatus.IN_TRANSIT]: 'Shipment is in transit',
    [ShipmentStatus.DELIVERED]: 'Shipment delivered',
    [ShipmentStatus.COMPLETED]: 'Shipment completed',
    [ShipmentStatus.CANCELLED]: 'Shipment cancelled',
    [ShipmentStatus.DISPUTED]: 'Shipment has a dispute',
  };
  return messages[status] || `Status updated to ${status}`;
};

export function useShipmentSocket() {
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const accessToken = getAccessToken();

    // When user is set, connect the socket
    if (user && accessToken) {
      if (!isConnectedRef.current) {
        const socket = connectSocket(accessToken);
        socketRef.current = socket;
        isConnectedRef.current = true;

        // Attach the shipment:updated listener
        socket.on('shipment:updated', (payload: ShipmentUpdatedPayload) => {
          // Add to notification store
          const notification: Omit<ShipmentNotification, 'id' | 'read'> = {
            event: payload.event,
            shipmentId: payload.shipmentId,
            trackingNumber: payload.trackingNumber,
            status: payload.status,
            origin: payload.origin,
            destination: payload.destination,
            updatedAt: payload.updatedAt,
          };
          addNotification(notification);

          // Show toast for standard transitions
          if (STANDARD_STATUSES.includes(payload.status)) {
            toast.info(getStatusMessage(payload.status), {
              description: `Tracking: ${payload.trackingNumber}`,
              duration: 5000,
            });
          }
        });
      }
    } else if (!user && isConnectedRef.current) {
      // When user becomes null (logout), disconnect
      if (socketRef.current) {
        socketRef.current.off('shipment:updated');
        socketRef.current = null;
      }
      disconnectSocket();
      isConnectedRef.current = false;
    }
  }, [user, addNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off('shipment:updated');
        socketRef.current = null;
      }
      disconnectSocket();
      isConnectedRef.current = false;
    };
  }, []);
}
