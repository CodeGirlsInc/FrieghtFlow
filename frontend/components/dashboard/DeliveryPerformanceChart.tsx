"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAnalytics } from "@/lib/dashboard/types";

export default function DeliveryPerformanceChart(props: { analytics: DashboardAnalytics }) {
  const data = [...props.analytics.charts.deliveryPerformance];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickMargin={8} minTickGap={18} />
        <YAxis tickMargin={8} width={48} domain={[0, 100]} />
        <Tooltip />
        <Area type="monotone" dataKey="onTimeRate" name="On time (%)" stroke="#10b981" fill="#10b98133" />
        <Area type="monotone" dataKey="delayedRate" name="Delayed (%)" stroke="#ef4444" fill="#ef444433" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

