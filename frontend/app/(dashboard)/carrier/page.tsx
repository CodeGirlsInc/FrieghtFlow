'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Truck, CheckCircle, DollarSign, Star } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { Skeleton } from '../../../components/ui/skeleton';
import { Shipment, ShipmentStatus } from '../../../types/shipment.types';

/**
 * How long to wait for `fetchCurrentUser()` before giving up and offering a
 * retry. 10s is comfortably longer than a slow connection needs for
 * GET /auth/me (including a token-refresh round trip, since a 401 triggers a
 * POST /auth/refresh and a retry before the request settles), while still
 * being short enough that a user on a dropped connection isn't left staring at
 * "Loading…" with no way forward.
 */
const AUTH_FETCH_TIMEOUT_MS = 10_000;

/**
 * Where the auth bootstrap is. 'loading' is still in flight, 'error' means it
 * timed out or threw (retryable), 'unauthenticated' means it settled with no
 * user, and 'ready' means a user arrived.
 */
type AuthPhase = 'loading' | 'error' | 'unauthenticated' | 'ready';

export default function CarrierDashboardPage() {
  const router = useRouter();
  const { user, fetchCurrentUser, isLoading } = useAuthStore();
  const [actionable, setActionable] = useState<Shipment[]>([]);
  const [stats, setStats] = useState({ active: 0, completedMonth: 0, totalEarnings: 0, avgRating: 4.8 });
  const [dataLoading, setDataLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [authPhase, setAuthPhase] = useState<AuthPhase>('loading');
  // Bumped per attempt so a late-settling request from a superseded attempt
  // (e.g. one that lost the race to a retry) can't overwrite the current phase.
  const attemptRef = useRef(0);
  // Clears the in-flight attempt's timeout, whichever attempt is current —
  // including one started from the retry button, which has no effect to own it.
  const clearAuthTimerRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
      clearAuthTimerRef.current?.();
    },
    [],
  );

  const beginAuthFetch = useCallback((): (() => void) => {
    clearAuthTimerRef.current?.();

    const attempt = (attemptRef.current += 1);
    setAuthPhase('loading');

    // Nothing may setState once this component is gone, whichever branch
    // (timeout or settle) gets there — otherwise the user loses the race
    // against unmount and React warns about updating an unmounted component.
    const isCurrent = () => mountedRef.current && attempt === attemptRef.current;

    const timer = setTimeout(() => {
      if (isCurrent()) setAuthPhase('error');
    }, AUTH_FETCH_TIMEOUT_MS);
    clearAuthTimerRef.current = () => clearTimeout(timer);

    fetchCurrentUser().then(
      () => {
        clearTimeout(timer);
        if (!isCurrent()) return;
        // fetchCurrentUser() swallows its own errors, so a null user here means
        // the session is gone (401, refresh failure) rather than "still trying".
        setAuthPhase(useAuthStore.getState().user ? 'ready' : 'unauthenticated');
      },
      () => {
        clearTimeout(timer);
        if (!isCurrent()) return;
        setAuthPhase('error');
      },
    );

    return () => clearTimeout(timer);
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (user) return;
    return beginAuthFetch();
  }, [user, beginAuthFetch]);

  // Signed-out visitor: send them to login rather than showing an error or an
  // endless "Loading…". /carrier isn't in middleware's protectedRoutes.
  useEffect(() => {
    if (authPhase === 'unauthenticated') router.replace('/login');
  }, [authPhase, router]);

  // Role guard – redirect non-carriers
  useEffect(() => {
    if (!isLoading && user && user.role !== 'carrier') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'carrier') return;

    setDataLoading(true);
    Promise.all([
      shipmentApi.list({ status: ShipmentStatus.ACCEPTED, limit: 20 }),
      shipmentApi.list({ status: ShipmentStatus.IN_TRANSIT, limit: 20 }),
      shipmentApi.list({ status: ShipmentStatus.COMPLETED, limit: 50 }),
    ])
      .then(([accepted, inTransit, completed]) => {
        // Shipments requiring action: accepted but not yet picked up
        setActionable(accepted.data);

        // Stats
        const now = new Date();
        const completedThisMonth = completed.data.filter((s) => {
          const d = new Date(s.updatedAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const totalEarnings = completed.data.reduce((sum, s) => sum + s.price, 0);

        setStats({
          active: inTransit.total,
          completedMonth: completedThisMonth.length,
          totalEarnings,
          avgRating: 4.8, // placeholder until ratings API is available
        });
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  const markInTransit = async (id: string) => {
    setUpdating(id);
    try {
      await shipmentApi.pickup(id);
      setActionable((prev) => prev.filter((s) => s.id !== id));
      setStats((s) => ({ ...s, active: s.active + 1 }));
      toast.success('Shipment marked as in-transit.');
    } catch {
      toast.error('Failed to update shipment.');
    } finally {
      setUpdating(null);
    }
  };

  const markDelivered = async (id: string) => {
    setUpdating(id);
    try {
      await shipmentApi.markDelivered(id);
      setActionable((prev) => prev.filter((s) => s.id !== id));
      toast.success('Shipment marked as delivered.');
    } catch {
      toast.error('Failed to update shipment.');
    } finally {
      setUpdating(null);
    }
  };

  if (!user) {
    if (authPhase === 'error') {
      return (
        <div className="flex flex-col items-center justify-center gap-3 h-full p-8 text-center">
          <p role="alert" className="text-destructive text-sm">
            We couldn&apos;t load your account. Check your connection and try again.
          </p>
          <Button onClick={() => beginAuthFetch()}>Retry loading account</Button>
        </div>
      );
    }

    if (authPhase === 'unauthenticated') {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <p role="status" aria-live="polite" className="text-muted-foreground">
            Redirecting to sign in&hellip;
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full p-8">
        <p role="status" aria-live="polite" className="text-muted-foreground">
          Loading&hellip;
        </p>
      </div>
    );
  }

  if (user.role !== 'carrier') return null;

  const summaryCards = [
    { label: 'Active Shipments', value: stats.active, icon: Truck, sub: 'Currently in transit' },
    { label: 'Completed This Month', value: stats.completedMonth, icon: CheckCircle, sub: 'Delivered on time' },
    {
      label: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      sub: 'All time',
    },
    { label: 'Average Rating', value: stats.avgRating.toFixed(1), icon: Star, sub: 'Out of 5.0' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Carrier Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {user.firstName}. Here&apos;s your overview.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{dataLoading ? '—' : value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shipments requiring action */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">Shipments Requiring Action</h2>

        {dataLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : actionable.length === 0 ? (
          <EmptyState
            title="No shipments require action"
            description="Browse the marketplace to find your next job."
            cta={{ label: 'Find new jobs', onClick: () => window.location.assign('/marketplace') }}
          />
        ) : (
          <div className="space-y-3">
            {actionable.map((shipment) => (
              <Card key={shipment.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {shipment.origin} → {shipment.destination}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      #{shipment.trackingNumber} · {shipment.weightKg} kg ·{' '}
                      <span className="capitalize">{shipment.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === shipment.id}
                      onClick={() => markInTransit(shipment.id)}
                    >
                      Mark In-Transit
                    </Button>
                    <Button
                      size="sm"
                      disabled={updating === shipment.id}
                      onClick={() => markDelivered(shipment.id)}
                    >
                      Mark Delivered
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
