'use client';

import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, subWeeks, startOfWeek, subMonths, startOfMonth, subDays } from 'date-fns';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Shipment, ShipmentStatus } from '../../../types/shipment.types';
import { useAuthStore } from '../../../stores/auth.store';

const LineChartLazy = lazy(() =>
  import('recharts').then((m) => ({ default: m.LineChart }))
);
const BarChartLazy = lazy(() =>
  import('recharts').then((m) => ({ default: m.BarChart }))
);
const PieChartLazy = lazy(() =>
  import('recharts').then((m) => ({ default: m.PieChart }))
);

import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Pie, Cell, Legend, Bar,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  [ShipmentStatus.PENDING]: '#f59e0b',
  [ShipmentStatus.ACCEPTED]: '#3b82f6',
  [ShipmentStatus.IN_TRANSIT]: '#8b5cf6',
  [ShipmentStatus.DELIVERED]: '#10b981',
  [ShipmentStatus.COMPLETED]: '#22c55e',
  [ShipmentStatus.CANCELLED]: '#ef4444',
  [ShipmentStatus.DISPUTED]: '#f97316',
};

const BAR_COLOR = '#6366f1';
const LINE_COLOR = '#6366f1';

const DATE_RANGES = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'All time', value: 'all' },
] as const;

function buildWeeklyData(shipments: Shipment[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 11 - i));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = shipments.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    return { week: format(weekStart, 'MMM d'), count };
  });
}

function buildStatusData(shipments: Shipment[]) {
  const counts: Record<string, number> = {};
  for (const s of shipments) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
  }
  return Object.entries(counts).map(([status, value]) => ({
    name: status.replace('_', ' '),
    value,
    status,
  }));
}

function buildMonthlySpend(shipments: Shipment[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(now, 5 - i));
    const monthEnd = startOfMonth(subMonths(now, 4 - i));
    const spend = shipments
      .filter((s) => {
        const d = new Date(s.createdAt);
        return d >= monthStart && d < monthEnd;
      })
      .reduce((sum, s) => sum + s.price, 0);
    return { month: format(monthStart, 'MMM yy'), spend };
  });
}

function buildTopRoutes(shipments: Shipment[]) {
  const routeCounts: Record<string, number> = {};
  for (const s of shipments) {
    const key = `${s.origin} → ${s.destination}`;
    routeCounts[key] = (routeCounts[key] ?? 0) + 1;
  }
  return Object.entries(routeCounts)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export default function AnalyticsDashboardPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateRange = searchParams.get('range') ?? '90d';

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const setDateRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', range);
    router.push(`/analytics?${params.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    const limit = dateRange === 'all' ? 500 : dateRange === '6m' ? 300 : 200;
    shipmentApi
      .list({ limit })
      .then((res) => setShipments(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const filteredShipments = useMemo(() => {
    if (dateRange === 'all') return shipments;
    const cutoff =
      dateRange === '30d'
        ? subDays(new Date(), 30)
        : dateRange === '90d'
          ? subDays(new Date(), 90)
          : subMonths(new Date(), 6);
    return shipments.filter((s) => new Date(s.createdAt) >= cutoff);
  }, [shipments, dateRange]);

  const kpis = useMemo(() => {
    const active = filteredShipments.filter(
      (s) =>
        s.status === ShipmentStatus.PENDING ||
        s.status === ShipmentStatus.ACCEPTED ||
        s.status === ShipmentStatus.IN_TRANSIT,
    ).length;

    const completed = filteredShipments.filter(
      (s) => s.status === ShipmentStatus.COMPLETED,
    );
    const delivered = filteredShipments.filter(
      (s) => s.status === ShipmentStatus.DELIVERED || s.status === ShipmentStatus.COMPLETED,
    );
    const onTimeRate =
      filteredShipments.length > 0
        ? Math.round((delivered.length / filteredShipments.length) * 100)
        : 0;

    const totalSpend = filteredShipments.reduce((sum, s) => sum + s.price, 0);

    return { active, onTimeRate, totalSpend, total: filteredShipments.length };
  }, [filteredShipments]);

  const weeklyData = useMemo(() => buildWeeklyData(filteredShipments), [filteredShipments]);
  const statusData = useMemo(() => buildStatusData(filteredShipments), [filteredShipments]);
  const monthlySpend = useMemo(() => buildMonthlySpend(filteredShipments), [filteredShipments]);
  const topRoutes = useMemo(() => buildTopRoutes(filteredShipments), [filteredShipments]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-destructive text-sm">Failed to load analytics data. Please refresh.</p>
      </div>
    );
  }

  const isEmpty = filteredShipments.length === 0;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Shipment activity and spend overview.</p>
        </div>
        <div className="flex gap-1 border border-border rounded-md overflow-hidden">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.value}
              onClick={() => setDateRange(dr.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                dateRange === dr.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No shipment data yet. Create your first shipment to see analytics.</p>
        </div>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Active Shipments</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpis.active}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpis.onTimeRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold text-foreground mt-1">${kpis.totalSpend.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Shipments</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpis.total}</p>
              </CardContent>
            </Card>
          </div>

          <Suspense fallback={<div className="h-64 bg-muted rounded-xl animate-pulse" />}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Shipments Created — Last 12 Weeks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div role="img" aria-label={`Line chart showing shipments per week: ${weeklyData.map((d) => `${d.week}: ${d.count}`).join(', ')}`}>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChartLazy data={weeklyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          formatter={(v: number) => [v, 'Shipments']}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={LINE_COLOR}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChartLazy>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipments by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {statusData.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
                  ) : (
                    <div role="img" aria-label={`Status distribution: ${statusData.map((d) => `${d.name}: ${d.value}`).join(', ')}`}>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChartLazy>
                          <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                          >
                            {statusData.map((entry) => (
                              <Cell
                                key={entry.status}
                                fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                            formatter={(v: number, name: string) => [v, name]}
                          />
                          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                        </PieChartLazy>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monthly Spend — Last 6 Months</CardTitle>
                </CardHeader>
                <CardContent>
                  <div role="img" aria-label={`Monthly spend: ${monthlySpend.map((d) => `${d.month}: $${d.spend.toLocaleString()}`).join(', ')}`}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChartLazy data={monthlySpend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          formatter={(v: number) => [`$${v.toLocaleString()}`, 'Spend']}
                        />
                        <Bar dataKey="spend" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                      </BarChartLazy>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top routes table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  {topRoutes.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {topRoutes.map((r, i) => (
                        <div key={r.route} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate">{r.route}</span>
                          <span className="text-muted-foreground font-medium">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Suspense>
        </>
      )}
    </div>
  );
}
