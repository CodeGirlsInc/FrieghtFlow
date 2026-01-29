"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPIGrid from "@/components/dashboard/KPIGrid";
import ChartCard from "@/components/dashboard/ChartCard";
import ShipmentStatusChart from "@/components/dashboard/ShipmentStatusChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopRoutesChart from "@/components/dashboard/TopRoutesChart";
import DeliveryPerformanceChart from "@/components/dashboard/DeliveryPerformanceChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import RecentShipmentsTable from "@/components/dashboard/RecentShipmentsTable";
import { Skeleton } from "@/components/shared/Skeleton";
import type { UserRole } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import { flattenActivityPages, useDashboardAnalytics, useRecentActivity } from "@/lib/dashboard/hooks";

function parseRole(input: string | null | undefined): UserRole | undefined {
  const v = (input ?? "").toUpperCase();
  if (v === "SHIPPER" || v === "CARRIER" || v === "DISPATCHER") return v;
  return undefined;
}

function DashboardPage() {
  const { user } = useAuth();
  const sp = useSearchParams();
  const roleFromQuery = parseRole(sp.get("role"));

  const [role, setRole] = React.useState<UserRole>(() => {
    const fromUser = user?.role;
    const fromStorage =
      typeof window !== "undefined" ? parseRole(localStorage.getItem("ff_role")) : undefined;
    return roleFromQuery ?? fromUser ?? fromStorage ?? "SHIPPER";
  });

  React.useEffect(() => {
    if (roleFromQuery && roleFromQuery !== role) {
      setRole(roleFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFromQuery]);

  React.useEffect(() => {
    try {
      localStorage.setItem("ff_role", role);
    } catch {}
  }, [role]);

  const analyticsQ = useDashboardAnalytics(role);
  const activityQ = useRecentActivity(role, 10);

  const unreadCount = React.useMemo(() => {
    const items = flattenActivityPages(activityQ.data?.pages);
    return items.filter((x) => x.isUnread).length;
  }, [activityQ.data?.pages]);

  const analytics = analyticsQ.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader role={role} onRoleChange={setRole} unreadCount={unreadCount} />

        {analyticsQ.isLoading || !analytics ? (
          <>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </section>
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </section>
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Skeleton className="h-[520px] rounded-2xl lg:col-span-1" />
              <Skeleton className="h-[520px] rounded-2xl lg:col-span-2" />
            </section>
          </>
        ) : analyticsQ.isError ? (
          <div className="rounded-2xl border bg-background p-6">
            <div className="text-sm text-destructive">Failed to load dashboard data.</div>
            <button
              className="mt-3 text-sm underline underline-offset-4"
              onClick={() => analyticsQ.refetch()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <KPIGrid role={role} analytics={analytics} />

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <ChartCard title="Shipment Status Distribution" subtitle="Overview by status">
                <ShipmentStatusChart analytics={analytics} />
              </ChartCard>
              <ChartCard
                title={role === "SHIPPER" ? "Cost Over Time" : "Revenue Over Time"}
                subtitle="Last 30 days"
              >
                <RevenueChart analytics={analytics} label={role === "SHIPPER" ? "Cost" : "Revenue"} />
              </ChartCard>
              <ChartCard title="Top Routes" subtitle="Most active lanes">
                <TopRoutesChart analytics={analytics} />
              </ChartCard>
              <ChartCard title="Delivery Performance" subtitle="On‑time vs delayed">
                <DeliveryPerformanceChart analytics={analytics} />
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 h-[500px] sm:h-[600px]">
                <ActivityFeed role={role} />
              </div>
              <div className="lg:col-span-2 h-[500px] sm:h-[600px]">
                <RecentShipmentsTable role={role} />
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;

