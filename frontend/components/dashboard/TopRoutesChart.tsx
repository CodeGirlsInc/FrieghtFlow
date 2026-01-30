"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAnalytics } from "@/lib/dashboard/types";

export default function TopRoutesChart(props: { analytics: DashboardAnalytics }) {
  const data = [...props.analytics.charts.topRoutes];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="route" tickMargin={8} interval={0} angle={-10} height={50} />
        <YAxis tickMargin={8} width={40} />
        <Tooltip />
        <Bar dataKey="shipments" name="Shipments" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

