'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi, PlatformStats } from '../../../../lib/api/admin.api';
import { apiClient } from '../../../../lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface DailyCount {
  date: string;
  count: number;
}

interface TopUser {
  id: string;
  name: string;
  role: 'carrier' | 'shipper';
  shipmentCount: number;
}

interface AnalyticsData {
  dailyShipments: DailyCount[];
  topCarriers: TopUser[];
  topShippers: TopUser[];
}

function StatCard({ title, value, highlight = false }: { title: string; value: string | number; highlight?: boolean }) {
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

export default function AdminStatsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    Promise.all([
      adminApi.getStats(),
      apiClient<AnalyticsData>('/shipments/analytics').catch(() => null),
    ])
      .then(([s, a]) => {
        setStats(s);
        setAnalytics(a);
      })
      .catch(() => toast.error('Failed to load statistics'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const topUsers: TopUser[] = [
    ...(analytics?.topCarriers ?? []),
    ...(analytics?.topShippers ?? []),
  ]
    .sort((a, b) => b.shipmentCount - a.shipmentCount)
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">High-level overview of platform health</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={stats.users.total} />
            <StatCard title="Active Shipments" value={stats.shipments.byStatus.in_transit ?? 0} />
            <StatCard
              title="Monthly Revenue"
              value={`$${stats.revenue.totalCompleted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <StatCard
              title="Open Disputes"
              value={stats.shipments.disputesPending}
              highlight={stats.shipments.disputesPending > 0}
            />
          </div>

          {/* Daily shipments chart */}
          {analytics?.dailyShipments && analytics.dailyShipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Shipment Creations (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={analytics.dailyShipments} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12 }}
                      formatter={(v: number) => [v, 'Shipments']}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      strokeWidth={2}
                      dot={false}
                      className="stroke-primary"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top carriers & shippers table */}
          {topUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Most Active Carriers & Shippers</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-left">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Role</th>
                      <th className="pb-2 font-medium text-right">Shipments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-2">{u.name}</td>
                        <td className="py-2 capitalize text-muted-foreground">{u.role}</td>
                        <td className="py-2 text-right font-medium">{u.shipmentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
