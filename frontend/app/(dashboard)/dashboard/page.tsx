'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ShipmentCard } from '../../../components/shipment/shipment-card';
import { Shipment, ShipmentStatus } from '../../../types/shipment.types';

interface Stats {
  active: number;
  completed: number;
  pending: number;
}

export default function DashboardPage() {
  const { user, fetchCurrentUser, isLoading } = useAuthStore();
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Stats>({ active: 0, completed: 0, pending: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) fetchCurrentUser();
  }, [user, fetchCurrentUser]);

  useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    Promise.all([
      shipmentApi.list({ limit: 4 }),
      shipmentApi.list({ status: ShipmentStatus.PENDING, limit: 1 }),
      shipmentApi.list({ status: ShipmentStatus.IN_TRANSIT, limit: 1 }),
      shipmentApi.list({ status: ShipmentStatus.COMPLETED, limit: 1 }),
    ])
      .then(([recent, pending, inTransit, completed]) => {
        setRecentShipments(recent.data);
        setStats({
          pending: pending.total,
          active: inTransit.total,
          completed: completed.total,
        });
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const isShipper = user.role === 'shipper' || user.role === 'admin';
  const isCarrier = user.role === 'carrier';

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {user.firstName}!
          </h1>
          <p className="text-muted-foreground capitalize">{user.role} account</p>
        </div>
        {isShipper && (
          <Button asChild>
            <Link href="/shipments/new">+ New Shipment</Link>
          </Button>
        )}
        {isCarrier && (
          <Button asChild variant="outline">
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        )}
      </div>

      {/* Email verification banner */}
      {!user.isEmailVerified && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <strong>Verify your email:</strong> We sent a verification link to{' '}
          <span className="font-medium">{user.email}</span>. Please check your inbox to
          unlock all features.
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isCarrier ? 'Active Jobs' : 'Active Shipments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {dataLoading ? '—' : stats.active}
            </p>
            <p className="text-xs text-muted-foreground mt-1">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {dataLoading ? '—' : stats.pending}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isCarrier ? 'Awaiting pickup' : 'Awaiting carrier'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {dataLoading ? '—' : stats.completed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent shipments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Recent Shipments</h2>
          <Link
            href="/shipments"
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        {dataLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentShipments.length === 0 ? (
          <div className="text-center py-10 rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground text-sm">
              {isShipper
                ? 'No shipments yet. Create your first one!'
                : 'No assigned shipments yet. Check the marketplace.'}
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <Link href={isShipper ? '/shipments/new' : '/marketplace'}>
                {isShipper ? 'Create Shipment' : 'Open Marketplace'}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentShipments.map((s) => (
              <ShipmentCard key={s.id} shipment={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
