'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { format, subWeeks, startOfWeek, subMonths, startOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { shipmentApi } from '@/lib/api/shipment.api';
import { apiClient } from '@/lib/api/client';
import type { Shipment, ShipmentStatus } from '@/types/shipment.types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  in_transit: '#8b5cf6',
  delivered: '#10b981',
  completed: '#22c55e',
  cancelled: '#ef4444',
  disputed: '#f97316',
};

const BAR_COLOR = '#6366f1';
const LINE_COLOR = '#6366f1';

interface AnalyticsData {
  totalShipments: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  onTimeRate: number;
  activeShipments: number;
  weeklyData: { week: string; count: number }[];
  statusData: { name: string; value: number; status: string }[];
  monthlySpend: { month: string; spend: number }[];
}

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
    name: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
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

export function AnalyticsDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState<'12w' | '6m' | 'all'>('12w');

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => apiClient<AnalyticsData>('/analytics/shipments'),
    enabled: false, // fallback to local calculation
  });

  useEffect(() => {
    setLoading(true);
    shipmentApi
      .list({ limit: 200 })
      .then((res) => setShipments(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = useMemo(() => buildWeeklyData(shipments), [shipments]);
  const statusData = useMemo(() => buildStatusData(shipments), [shipments]);
  const monthlySpend = useMemo(() => buildMonthlySpend(shipments), [shipments]);

  const kpis = useMemo(() => {
    const completed = shipments.filter((s) => s.status === 'completed');
    const totalRevenue = completed.reduce((sum, s) => sum + s.price, 0);
    const active = shipments.filter(
      (s) => s.status === 'in_transit' || s.status === 'accepted',
    ).length;
    return { totalShipments: shipments.length, totalRevenue, activeShipments: active };
  }, [shipments]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-destructive text-sm">Failed to load analytics data. Please refresh.</p>
      </div>
    );
  }

  const isEmpty = shipments.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Shipment activity and spending overview.
          </p>
        </div>
        <div className="flex gap-1 border border-border rounded-md overflow-hidden">
          {(['12w', '6m', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                dateRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {range === '12w' ? '12 Weeks' : range === '6m' ? '6 Months' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{kpis.totalShipments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ${kpis.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{kpis.activeShipments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Delivery Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">—</p>
          </CardContent>
        </Card>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No shipment data yet. Create your first shipment to see analytics.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Shipment Volume Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Shipments Created — Last 12 Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weeklyData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
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
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipments by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
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
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Monthly Spend Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Spend — Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlySpend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Spend']}
                  />
                  <Bar dataKey="spend" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Carriers (Admin) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Carriers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">
                Carrier performance data will appear once shipments are completed with carrier ratings.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
