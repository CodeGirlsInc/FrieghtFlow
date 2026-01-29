"use client";

import type { UserRole } from "@/lib/auth-context";
import type { DashboardAnalytics } from "@/lib/dashboard/types";
import KPICard from "@/components/dashboard/KPICard";
import {
  Activity,
  BadgeDollarSign,
  ClipboardList,
  Clock,
  DollarSign,
  PackageCheck,
  Star,
  Truck,
  Users,
  AlertTriangle,
} from "lucide-react";

function formatCurrencyNGN(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₦${n.toLocaleString()}`;
  }
}

export default function KPIGrid(props: { role: UserRole; analytics: DashboardAnalytics }) {
  const { role, analytics } = props;
  const m = analytics.metrics;

  const cards =
    role === "SHIPPER"
      ? [
          {
            title: "Active Shipments",
            value: m.activeShipments ?? 0,
            icon: <Truck className="h-4 w-4" />,
            trend:
              typeof m.activeShipmentsTrendPct === "number"
                ? {
                    direction: (m.activeShipmentsTrendPct >= 0 ? "up" : "down") as "up" | "down",
                    valuePct: m.activeShipmentsTrendPct,
                  }
                : undefined,
            tone: ((m.activeShipmentsTrendPct ?? 0) >= 0 ? "positive" : "warning") as "positive" | "warning",
          },
          {
            title: "Pending Deliveries",
            value: m.pendingDeliveries ?? 0,
            icon: <Clock className="h-4 w-4" />,
            tone: "warning" as const,
          },
          {
            title: "Total Spent (MTD)",
            value: formatCurrencyNGN(m.totalSpentThisMonth ?? 0),
            icon: <DollarSign className="h-4 w-4" />,
            tone: "neutral" as const,
          },
          {
            title: "On‑Time Delivery Rate",
            value: `${m.onTimeDeliveryRate ?? 0}%`,
            icon: <PackageCheck className="h-4 w-4" />,
            tone: ((m.onTimeDeliveryRate ?? 0) >= 90 ? "positive" : "warning") as "positive" | "warning",
          },
        ]
      : role === "CARRIER"
        ? [
            {
              title: "Active Jobs",
              value: m.activeJobs ?? 0,
              icon: <ClipboardList className="h-4 w-4" />,
              tone: "neutral" as const,
            },
            {
              title: "Available Jobs",
              value: m.availableJobs ?? 0,
              icon: <Activity className="h-4 w-4" />,
              tone: "positive" as const,
            },
            {
              title: "Revenue (MTD)",
              value: formatCurrencyNGN(m.revenueThisMonth ?? 0),
              icon: <BadgeDollarSign className="h-4 w-4" />,
              tone: "positive" as const,
            },
            {
              title: "Average Rating",
              value: `${m.averageRating ?? 0} / 5`,
              icon: <Star className="h-4 w-4" />,
              tone: ((m.averageRating ?? 0) >= 4.5 ? "positive" : "neutral") as "positive" | "neutral",
            },
          ]
        : [
            {
              title: "Total Active Shipments",
              value: m.totalActiveShipments ?? 0,
              icon: <Truck className="h-4 w-4" />,
              tone: "neutral" as const,
            },
            {
              title: "Carriers Online",
              value: m.carriersOnline ?? 0,
              icon: <Users className="h-4 w-4" />,
              tone: "positive" as const,
            },
            {
              title: "Issues Reported",
              value: m.issuesReported ?? 0,
              icon: <AlertTriangle className="h-4 w-4" />,
              tone: ((m.issuesReported ?? 0) > 0 ? "danger" : "positive") as "danger" | "positive",
            },
            {
              title: "System Utilization",
              value: `${m.systemUtilization ?? 0}%`,
              icon: <Activity className="h-4 w-4" />,
              tone: ((m.systemUtilization ?? 0) >= 75 ? "positive" : "neutral") as "positive" | "neutral",
            },
          ];

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <KPICard key={c.title} {...c} />
      ))}
    </section>
  );
}

