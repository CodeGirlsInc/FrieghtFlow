'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Truck, CheckCircle, DollarSign, Star } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Shipment, ShipmentStatus } from '../../../types/shipment.types';

export default function CarrierDashboardPage() {
  const router = useRouter();
  const { user, fetchCurrentUser, isLoading } = useAuthStore();
  const [actionable, setActionable] = useState<Shipment[]>([]);
  const [stats, setStats] = useState({ active: 0, completedMonth: 0, totalEarnings: 0, avgRating: 4.8 });
  const [dataLoading, setDataLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) fetchCurrentUser();
  }, [user, fetchCurrentUser]);

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

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">Loading…</p>
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
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : actionable.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-muted-foreground text-sm">No shipments require action right now.</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/marketplace">Find new jobs</Link>
            </Button>
          </div>
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
