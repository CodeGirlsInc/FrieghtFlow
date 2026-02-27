'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shipment, ShipmentStatus, ShipmentStatusHistory } from '../../../../types/shipment.types';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { useAuthStore } from '../../../../stores/auth.store';
import { StatusBadge } from '../../../../components/shipment/status-badge';
import { StatusTimeline } from '../../../../components/shipment/status-timeline';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const reload = async () => {
    const [s, h] = await Promise.all([
      shipmentApi.getById(id),
      shipmentApi.getHistory(id),
    ]);
    setShipment(s);
    setHistory(h);
  };

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => toast.error('Failed to load shipment'))
      .finally(() => setLoading(false));
  }, [id]);

  const act = async (fn: () => Promise<unknown>, successMsg: string) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      await reload();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Shipment not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const isShipper = user?.id === shipment.shipperId;
  const isCarrier = user?.id === shipment.carrierId;
  const isAdmin = user?.role === 'admin';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: shipment.currency || 'USD',
  }).format(Number(shipment.price));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs text-muted-foreground hover:text-foreground mb-2 block"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-foreground font-mono">
            {shipment.trackingNumber}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {shipment.origin} → {shipment.destination}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cargo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{shipment.cargoDescription}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Weight</span>
                  <p className="font-medium">{Number(shipment.weightKg).toLocaleString()} kg</p>
                </div>
                {shipment.volumeCbm && (
                  <div>
                    <span className="text-muted-foreground">Volume</span>
                    <p className="font-medium">{Number(shipment.volumeCbm)} m³</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Price</span>
                  <p className="font-semibold text-foreground">{formattedPrice}</p>
                </div>
              </div>
              {shipment.notes && (
                <p className="text-muted-foreground italic text-sm border-t pt-2">
                  {shipment.notes}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipper</span>
                <span className="font-medium">
                  {shipment.shipper.firstName} {shipment.shipper.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier</span>
                <span className="font-medium">
                  {shipment.carrier
                    ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}`
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {/* Carrier actions */}
              {shipment.status === ShipmentStatus.PENDING && !isShipper && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => act(() => shipmentApi.accept(shipment.id), 'Shipment accepted!')}
                >
                  Accept Job
                </Button>
              )}
              {shipment.status === ShipmentStatus.ACCEPTED && isCarrier && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => act(() => shipmentApi.pickup(shipment.id), 'Marked as picked up!')}
                >
                  Mark Picked Up
                </Button>
              )}
              {shipment.status === ShipmentStatus.IN_TRANSIT && isCarrier && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    act(() => shipmentApi.markDelivered(shipment.id), 'Marked as delivered!')
                  }
                >
                  Mark Delivered
                </Button>
              )}

              {/* Shipper actions */}
              {shipment.status === ShipmentStatus.DELIVERED && isShipper && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    act(() => shipmentApi.confirmDelivery(shipment.id), 'Delivery confirmed!')
                  }
                >
                  Confirm Delivery
                </Button>
              )}

              {/* Cancel */}
              {[ShipmentStatus.PENDING, ShipmentStatus.ACCEPTED].includes(shipment.status) &&
                (isShipper || isCarrier || isAdmin) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() =>
                      act(() => shipmentApi.cancel(shipment.id, 'Cancelled by user'), 'Shipment cancelled')
                    }
                  >
                    Cancel
                  </Button>
                )}

              {/* Dispute */}
              {[ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED].includes(shipment.status) &&
                (isShipper || isCarrier) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() =>
                      act(
                        () => shipmentApi.raiseDispute(shipment.id, 'Dispute raised by user'),
                        'Dispute raised',
                      )
                    }
                  >
                    Raise Dispute
                  </Button>
                )}

              {/* Admin resolve */}
              {shipment.status === ShipmentStatus.DISPUTED && isAdmin && (
                <>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      act(
                        () =>
                          shipmentApi.resolveDispute(
                            shipment.id,
                            ShipmentStatus.COMPLETED,
                            'Resolved by admin — completed',
                          ),
                        'Dispute resolved — completed',
                      )
                    }
                  >
                    Resolve: Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() =>
                      act(
                        () =>
                          shipmentApi.resolveDispute(
                            shipment.id,
                            ShipmentStatus.CANCELLED,
                            'Resolved by admin — cancelled',
                          ),
                        'Dispute resolved — cancelled',
                      )
                    }
                  >
                    Resolve: Cancel
                  </Button>
                </>
              )}

              {[ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED].includes(shipment.status) && (
                <p className="text-sm text-muted-foreground">
                  This shipment is {shipment.status} — no further actions available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline history={history} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
