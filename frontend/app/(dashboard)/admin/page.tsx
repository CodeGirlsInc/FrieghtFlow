'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '../../../stores/auth.store';
import { adminApi, PlatformStats } from '../../../lib/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    adminApi
      .getStats()
      .then(setStats)
      .catch(() => toast.error('Failed to load platform stats'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide overview</p>
      </div>

      {/* Quick nav */}
      <div className="flex gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">Manage Users</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/shipments">All Shipments</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* User stats */}
          <section>
            <h2 className="text-base font-semibold mb-3">Users</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Users" value={stats.users.total} />
              <StatCard title="Active" value={stats.users.active} />
              <StatCard title="Inactive" value={stats.users.inactive} />
              <StatCard title="Shippers" value={stats.users.byRole.shipper ?? 0} />
              <StatCard title="Carriers" value={stats.users.byRole.carrier ?? 0} />
              <StatCard title="Admins" value={stats.users.byRole.admin ?? 0} />
            </div>
          </section>

          {/* Shipment stats */}
          <section>
            <h2 className="text-base font-semibold mb-3">Shipments</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total" value={stats.shipments.total} />
              <StatCard title="Pending" value={stats.shipments.byStatus.pending ?? 0} />
              <StatCard title="In Transit" value={stats.shipments.byStatus.in_transit ?? 0} />
              <StatCard title="Completed" value={stats.shipments.byStatus.completed ?? 0} />
              <StatCard
                title="Disputed"
                value={stats.shipments.disputesPending}
                highlight={stats.shipments.disputesPending > 0}
              />
              <StatCard title="Cancelled" value={stats.shipments.byStatus.cancelled ?? 0} />
            </div>
          </section>

          {/* Revenue */}
          <section>
            <h2 className="text-base font-semibold mb-3">Revenue</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Completed Revenue"
                value={`$${stats.revenue.totalCompleted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-destructive/50' : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${highlight ? 'text-destructive' : 'text-foreground'}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
