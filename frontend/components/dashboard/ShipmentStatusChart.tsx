"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import type { DashboardAnalytics } from "@/lib/dashboard/types";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#64748b"];

export default function ShipmentStatusChart(props: { analytics: DashboardAnalytics }) {
  const data = props.analytics.charts.shipmentStatusDistribution.map((x) => ({
    name: x.status,
    value: x.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}

