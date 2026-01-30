"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";

export type Trend = {
  direction: "up" | "down" | "neutral";
  valuePct?: number;
};

export default function KPICard(props: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  trend?: Trend;
  tone?: "positive" | "warning" | "danger" | "neutral";
}) {
  const { title, value, icon, trend, tone = "neutral" } = props;

  const trendNode =
    trend && typeof trend.valuePct === "number" ? (
      <span
        className={
          tone === "positive"
            ? "text-green-600 dark:text-green-400"
            : tone === "warning"
              ? "text-orange-600 dark:text-orange-400"
              : tone === "danger"
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
        }
      >
        <span className="inline-flex items-center gap-1 font-medium">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : trend.direction === "down" ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : null}
          {trend.valuePct > 0 ? "+" : ""}
          {trend.valuePct}%
        </span>{" "}
        <span className="text-muted-foreground text-xs">vs last week</span>
      </span>
    ) : null;

  return <StatCard title={title} value={value} icon={icon} subtitle={trendNode} />;
}

