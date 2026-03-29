"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminStatsResponse } from "@/lib/api/admin.api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

export default function AdminStatsPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useAuthStore();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (!userLoading && user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="grid grid-cols-3 gap-4 p-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-24 w-full animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (!user || user.role !== "admin" || !stats) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.users.total} />
        <StatCard title="Active Users" value={stats.users.active} />
        <StatCard title="Inactive Users" value={stats.users.inactive} />
        <StatCard title="Shippers" value={stats.users.byRole.shipper} />
        <StatCard title="Carriers" value={stats.users.byRole.carrier} />
        <StatCard title="Admins" value={stats.users.byRole.admin} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Shipments" value={stats.shipments.total} />
        <StatCard title="Pending" value={stats.shipments.byStatus.pending} />
        <StatCard title="In Transit" value={stats.shipments.byStatus.in_transit} />
        <StatCard title="Completed" value={stats.shipments.byStatus.completed} />
        <StatCard
          title="Disputed"
          value={stats.shipments.disputesPending}
          destructive={stats.shipments.disputesPending > 0}
        />
        <StatCard title="Cancelled" value={stats.shipments.byStatus.cancelled} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <StatCard
          title="Total Revenue"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: stats.revenue.currency,
          }).format(stats.revenue.totalCompleted)}
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={() => router.push("/admin/users")}>Manage Users</Button>
        <Button onClick={() => router.push("/admin/shipments")}>Manage Shipments</Button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  destructive = false,
}: {
  title: string;
  value: string | number;
  destructive?: boolean;
}) {
  return (
    <Card className={cn("w-full", destructive && "border-red-500")}>
      <CardHeader>
        <CardTitle className={cn(destructive && "text-red-600")}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
