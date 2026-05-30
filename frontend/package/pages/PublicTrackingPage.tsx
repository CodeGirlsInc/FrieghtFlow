'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { shipmentApi } from '@/lib/api/shipment.api';
import { StatusTimeline } from '@/components/shipment/status-timeline';
import { StatusBadge } from '@/components/shipment/status-badge';
import type { Shipment, ShipmentStatusHistory } from '@/types/shipment.types';

export function PublicTrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!trackingNumber) return;
    setLoading(true);
    shipmentApi
      .track(trackingNumber)
      .then(async (s) => {
        setShipment(s);
        try {
          const hist = await shipmentApi.getHistory(s.id);
          setHistory(hist);
        } catch {
          // history is best-effort
        }
      })
      .catch((err: { statusCode?: number }) => {
        if (err?.statusCode === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => setLoading(false));
  }, [trackingNumber]);

  const copyTrackingUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Looking up shipment...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2 max-w-md">
          <p className="text-lg font-semibold text-foreground">Shipment Not Found</p>
          <p className="text-sm text-muted-foreground">
            No shipment found for tracking number{' '}
            <span className="font-mono font-medium">{trackingNumber}</span>.
            Please verify the number and try again.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-primary hover:text-primary/80 underline underline-offset-4"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Something Went Wrong</p>
          <p className="text-sm text-muted-foreground">
            Unable to retrieve tracking information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: shipment.currency || 'USD',
  });

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-1">
                {shipment.trackingNumber}
              </p>
              <h1 className="text-2xl font-bold text-foreground">
                {shipment.origin} → {shipment.destination}
              </h1>
            </div>
            <StatusBadge status={shipment.status} />
          </div>
          <button
            onClick={copyTrackingUrl}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            {copied ? 'Link copied!' : 'Copy tracking link'}
          </button>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Cargo</p>
            <p className="font-medium">{shipment.cargoDescription}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Weight</p>
            <p className="font-medium">{Number(shipment.weightKg).toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Price</p>
            <p className="font-medium">{fmt.format(Number(shipment.price))}</p>
          </div>
          {shipment.shipper && (
            <div>
              <p className="text-muted-foreground text-xs">Shipper</p>
              <p className="font-medium">
                {shipment.shipper.firstName} {shipment.shipper.lastName}
              </p>
            </div>
          )}
          {shipment.carrier && (
            <div>
              <p className="text-muted-foreground text-xs">Carrier</p>
              <p className="font-medium">
                {shipment.carrier.firstName} {shipment.carrier.lastName}
              </p>
            </div>
          )}
          {shipment.estimatedDeliveryDate && (
            <div>
              <p className="text-muted-foreground text-xs">Est. Delivery</p>
              <p className="font-medium">
                {new Date(shipment.estimatedDeliveryDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-base font-semibold mb-4">Status Timeline</h2>
          <StatusTimeline history={history} />
        </div>
      </div>
    </div>
  );
}
