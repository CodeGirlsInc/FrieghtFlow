'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { format, subWeeks, startOfWeek, subMonths, startOfMonth } from 'date-fns';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Shipment, ShipmentStatus } from '../../../types/shipment.types';

// ── Colour palette ────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalyticsDashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch a large batch to cover 12 weeks of history
    shipmentApi
      .list({ limit: 200 })
      .then((res) => setShipments(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = useMemo(() => buildWeeklyData(shipments), [shipments]);
  const statusData = useMemo(() => buildStatusData(shipments), [shipments]);
  const monthlySpend = useMemo(() => buildMonthlySpend(shipments), [shipments]);

  if (loading) {
    return (
      <div className="p-8 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
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

  const isEmpty = shipments.length === 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Shipment activity and spend overview.</p>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground text-sm">No shipment data yet. Create your first shipment to see analytics.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Line chart – shipments per week */}
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

          {/* Pie chart – status breakdown */}
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

          {/* Bar chart – monthly spend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Spend — Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlySpend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, 'Spend']}
                  />
                  <Bar dataKey="spend" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
