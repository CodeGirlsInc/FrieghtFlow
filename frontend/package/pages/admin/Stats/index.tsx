'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

interface AdminStats {
  totalUsers: number;
  activeShipments: number;
  completedShipments: number;
  totalRevenue: number;
  registrationsByMonth: { month: string; count: number }[];
  shipmentVolumeByMonth: { month: string; volume: number }[];
  usersByRole: { role: string; count: number }[];
}

const ROLE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

interface AdminStatsPageProps {
  stats?: AdminStats;
}

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  activeShipments: 0,
  completedShipments: 0,
  totalRevenue: 0,
  registrationsByMonth: [],
  shipmentVolumeByMonth: [],
  usersByRole: [],
};

export function AdminStatsPage({ stats = EMPTY_STATS }: AdminStatsPageProps) {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtitle="All registered accounts"
        />
        <KpiCard
          title="Active Shipments"
          value={stats.activeShipments.toLocaleString()}
          subtitle="In transit or pending"
        />
        <KpiCard
          title="Completed Shipments"
          value={stats.completedShipments.toLocaleString()}
          subtitle="Successfully delivered"
        />
        <KpiCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="From completed shipments"
        />
      </div>

      {/* Bar Chart — User Registrations */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          User Registrations by Month
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.registrationsByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="New Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart — Shipment Volume */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Shipment Volume Over Time
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={stats.shipmentVolumeByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="volume"
              name="Shipments"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart — Role Distribution */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          User Role Distribution
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={stats.usersByRole}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ role, percent }) =>
                `${role} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {stats.usersByRole.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminStatsPage;
