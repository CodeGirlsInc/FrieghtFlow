'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { shipmentApi } from '@/services/shipmentApi';
import ShipmentTimeline from '@/components/ShipmentTimeline';
import { toast } from 'react-hot-toast';

type UserRole = 'shipper' | 'carrier' | 'admin';
type ShipmentStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CANCELLED';

interface Shipment {
  id: string;
  description: string;
  weight: number;
  volume: number;
  price: number;
  origin: string;
  destination: string;
  shipperName: string;
  carrierName?: string;
  status: ShipmentStatus;
}

interface HistoryEvent {
  id: string;
  status: ShipmentStatus;
  timestamp: string;
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentRes, historyRes] = await Promise.all([
        shipmentApi.getById(id),
        shipmentApi.getHistory(id),
      ]);
      setShipment(shipmentRes);
      setHistory(historyRes);
    } catch (err) {
      toast.error('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleAction = async (action: string) => {
    try {
      setActionLoading(true);
      await shipmentApi.performAction(id, action);
      toast.success(`Action "${action}" successful`);
      await fetchData();
    } catch (err) {
      toast.error(`Failed to perform action: ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderActions = () => {
    const role: UserRole = 'carrier'; // TODO: derive from auth context
    const { status, carrierName } = shipment!;

    const buttons: JSX.Element[] = [];

    if (status === 'PENDING' && role !== 'shipper') {
      buttons.push(<button key="accept" onClick={() => handleAction('accept')}>Accept Job</button>);
    }
    if (status === 'ACCEPTED' && role === 'carrier' && carrierName) {
      buttons.push(<button key="pickup" onClick={() => handleAction('pickup')}>Mark Picked Up</button>);
    }
    if (status === 'IN_TRANSIT' && role === 'carrier' && carrierName) {
      buttons.push(<button key="deliver" onClick={() => handleAction('deliver')}>Mark Delivered</button>);
    }
    if (status === 'DELIVERED' && role === 'shipper') {
      buttons.push(<button key="confirm" onClick={() => handleAction('confirm')}>Confirm Delivery</button>);
    }
    if (['PENDING', 'ACCEPTED'].includes(status) && ['shipper', 'carrier', 'admin'].includes(role)) {
      buttons.push(<button key="cancel" onClick={() => handleAction('cancel')}>Cancel</button>);
    }
    if (['IN_TRANSIT', 'DELIVERED'].includes(status) && ['shipper', 'carrier'].includes(role)) {
      buttons.push(<button key="dispute" onClick={() => handleAction('dispute')}>Raise Dispute</button>);
    }
    if (status === 'DISPUTED' && role === 'admin') {
      buttons.push(
        <div key="resolve">
          <button onClick={() => handleAction('resolve_complete')}>Resolve: Complete</button>
          <button onClick={() => handleAction('resolve_cancel')}>Resolve: Cancel</button>
        </div>
      );
    }
    if (['COMPLETED', 'CANCELLED'].includes(status)) {
      buttons.push(<p key="none">No further actions</p>);
    }

    return <div className="space-y-2">{buttons}</div>;
  };

  // ...rest of your JSX

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Details + Actions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Cargo</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Description: {shipment.description}</li>
            <li>Weight: {shipment.weight} kg</li>
            <li>Volume: {shipment.volume} m³</li>
            <li>Price: ${shipment.price}</li>
          </ul>
        </div>

        <div className="border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Parties</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Shipper: {shipment.shipperName}</li>
            <li>Carrier: {shipment.carrierName || '—'}</li>
          </ul>
        </div>

        <div className="border rounded p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          {renderActions()}
        </div>
      </div>

      {/* Right: Timeline */}
      <div>
        <ShipmentTimeline history={history} />
      </div>
    </div>
  );
}
