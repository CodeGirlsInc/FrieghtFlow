"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin.api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/hooks/useUser"; // assumes you have a user hook

export default function AdminStatsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (!userLoading && user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, userLoading, router]);

  // Fetch stats
  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 p-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      {/* User stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.users.total} />
        <StatCard title="Active Users" value={stats.users.active} />
        <StatCard title="Inactive Users" value={stats.users.inactive} />
        <StatCard title="Shippers" value={stats.users.shippers} />
        <StatCard title="Carriers" value={stats.users.carriers} />
        <StatCard title="Admins" value={stats.users.admins} />
      </div>

      {/* Shipment stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Shipments" value={stats.shipments.total} />
        <StatCard title="Pending" value={stats.shipments.pending} />
        <StatCard title="In Transit" value={stats.shipments.inTransit} />
        <StatCard title="Completed" value={stats.shipments.completed} />
        <StatCard
          title="Disputed"
          value={stats.shipments.disputed}
          destructive={stats.shipments.disputed > 0}
        />
        <StatCard title="Cancelled" value={stats.shipments.cancelled} />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard
          title="Total Revenue"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(stats.revenue.completed)}
        />
      </div>

      {/* Quick navigation */}
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
  value: any;
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
