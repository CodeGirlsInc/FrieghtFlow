'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/auth.store';
import { getAccessToken, onTokenChange } from '../lib/api/client';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useNotificationStore } from '../stores/notification.store';

const EVENT_LABELS: Record<string, string> = {
  'shipment:created': 'New shipment created',
  'shipment:accepted': 'Shipment accepted by carrier',
  'shipment:in_transit': 'Shipment is now in transit',
  'shipment:delivered': 'Shipment has been delivered',
  'shipment:completed': 'Shipment completed',
  'shipment:cancelled': 'Shipment cancelled',
  'shipment:disputed': 'Dispute raised on shipment',
  'shipment:dispute_resolved': 'Shipment dispute resolved',
};

interface ShipmentUpdatedPayload {
  event: string;
  shipmentId: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  updatedAt: string;
}

export function useShipmentSocket() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  // getAccessToken() is a plain module read, not reactive — track it in
  // state via onTokenChange so a rotated/cleared token (refresh, hard
  // logout) reconnects or tears down the socket instead of the effect only
  // ever seeing the token that was live at mount (FE-110).
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  useEffect(() => onTokenChange(setToken), []);

  useEffect(() => {
    if (!user || !token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    const handleUpdate = (payload: ShipmentUpdatedPayload) => {
      const label = EVENT_LABELS[payload.event] ?? 'Shipment updated';
      const description = `${payload.trackingNumber} · ${payload.origin} → ${payload.destination}`;

      if (payload.event === 'shipment:disputed') {
        toast.warning(label, { description });
      } else if (payload.event === 'shipment:cancelled') {
        toast.error(label, { description });
      } else if (payload.event === 'shipment:completed') {
        toast.success(label, { description });
      } else {
        toast.info(label, { description });
      }

      addNotification({
        event: payload.event,
        shipmentId: payload.shipmentId,
        trackingNumber: payload.trackingNumber,
        status: payload.status,
        origin: payload.origin,
        destination: payload.destination,
        updatedAt: payload.updatedAt,
      });
    };

    socket.on('shipment:updated', handleUpdate);

    return () => {
      socket.off('shipment:updated', handleUpdate);
    };
  }, [user, token, addNotification]);
}
