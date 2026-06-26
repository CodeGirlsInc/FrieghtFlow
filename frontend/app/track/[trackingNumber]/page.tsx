'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { StatusTimeline } from '../../../components/shipment/status-timeline';
import { StatusBadge } from '../../../components/shipment/status-badge';
import type { Shipment, ShipmentStatusHistory } from '../../../types/shipment.types';

type ApiErrorLike = { statusCode?: number; response?: { status?: number } };

/** Best-effort extraction of an HTTP status code from an unknown thrown
 * value. Different clients (fetch wrappers, axios, custom API layers)
 * shape errors differently, so we check a couple of common shapes rather
 * than trusting a single cast. */
function getStatusCode(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const e = err as ApiErrorLike;
  return e.statusCode ?? e.response?.status;
}

/** Formats a numeric field that may arrive as null/undefined/non-numeric
 * from the API, falling back to a placeholder instead of rendering "NaN". */
function formatNumberOrFallback(value: unknown, formatter?: (n: number) => string): string {
  const n = Number(value);
  if (value === null || value === undefined || Number.isNaN(n)) return '—';
  return formatter ? formatter(n) : n.toLocaleString();
}

export default function TrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  // Bump this to manually trigger a re-fetch without changing trackingNumber
  // (used by the "Try again" button on the error state).
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!trackingNumber) return;

    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setError(false);
    setShipment(null);
    setHistory([]);

    shipmentApi
      .track(trackingNumber)
      .then(async (s) => {
        if (cancelled) return;
        setShipment(s);
        try {
          const hist = await shipmentApi.getHistory(s.id);
          if (!cancelled) setHistory(hist);
        } catch {
          // history is best-effort; shipment details still render without it
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (getStatusCode(err) === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Guards against a slower, stale request (from a previous tracking
    // number or a previous retry) overwriting state set by a newer one.
    return () => {
      cancelled = true;
    };
  }, [trackingNumber, retryToken]);

  const handleRetry = useCallback(() => setRetryToken((t) => t + 1), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Looking up shipment…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Shipment not found</p>
          <p className="text-sm text-muted-foreground">
            No shipment found for tracking number{' '}
            <span className="font-mono">{trackingNumber}</span>.
          </p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground">
            Unable to retrieve tracking information. Please try again later.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
          >
            Try again
          </button>
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
          <p className="text-xs text-muted-foreground font-mono mb-1">{shipment.trackingNumber}</p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {shipment.origin} → {shipment.destination}
            </h1>
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Cargo</p>
            <p className="font-medium">{shipment.cargoDescription || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Weight</p>
            <p className="font-medium">
              {formatNumberOrFallback(shipment.weightKg, (n) => `${n.toLocaleString()} kg`)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Price</p>
            <p className="font-medium">
              {formatNumberOrFallback(shipment.price, (n) => fmt.format(n))}
            </p>
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