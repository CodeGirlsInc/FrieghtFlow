"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAnalytics } from "@/lib/dashboard/types";

export default function RevenueChart(props: { analytics: DashboardAnalytics; label?: string }) {
  const data = [...props.analytics.charts.revenueOrCostOverTime];
  const label = props.label ?? "Amount";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickMargin={8} minTickGap={18} />
        <YAxis tickMargin={8} width={48} />
        <Tooltip />
        <Line type="monotone" dataKey="amount" name={label} stroke="#3b82f6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

