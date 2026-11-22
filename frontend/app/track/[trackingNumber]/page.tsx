'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { PublicStatusTimeline } from '../../../components/shipment/status-timeline';
import { StatusBadge } from '../../../components/shipment/status-badge';
import { ShipmentStatus, type PublicShipmentTracking } from '../../../types/shipment.types';

const POLL_INTERVAL_MS = 60_000;
const TERMINAL_STATUSES = new Set([ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED]);

export default function TrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [shipment, setShipment] = useState<PublicShipmentTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // `silent` keeps background refreshes from swapping the page back to its
  // full-screen spinner; manual refreshes use the same path.
  const fetchStatus = useCallback(
    async (silent = false) => {
      if (!trackingNumber) return;
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const data = await shipmentApi.track(trackingNumber);
        setShipment(data);
        setLastUpdated(new Date());
        setNotFound(false);
        setError(false);
      } catch (err: unknown) {
        const apiError = err as { statusCode?: number };
        if (apiError?.statusCode === 404) setNotFound(true);
        else if (!silent) setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [trackingNumber],
  );

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const isTerminal = shipment
    ? TERMINAL_STATUSES.has(shipment.status)
    : false;

  // Public tracking has no socket, so poll while the shipment is live. The
  // interval and the visibility handler never fire requests for hidden tabs,
  // and stop entirely once the shipment reaches a terminal status (#1850).
  useEffect(() => {
    if (!shipment || isTerminal) return;

    const poll = () => {
      if (!document.hidden) void fetchStatus(true);
    };
    const onVisibilityChange = () => {
      if (!document.hidden) void fetchStatus(true);
    };

    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [shipment?.status, isTerminal, fetchStatus]);

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
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground">
            Unable to retrieve tracking information. Please try again later.
          </p>
        </div>
      </div>
    );
  }


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
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            {lastUpdated && (
              <span aria-live="polite">
                Last updated {lastUpdated.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
            <button
              type="button"
              onClick={() => void fetchStatus(true)}
              disabled={refreshing}
              className="underline underline-offset-2 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
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
          <PublicStatusTimeline history={shipment.timeline} />
        </div>
      </div>
    </div>
  );
}
