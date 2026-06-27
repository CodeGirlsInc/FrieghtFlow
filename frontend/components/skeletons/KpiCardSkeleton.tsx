import { Skeleton } from "../ui/skeleton";

/** Skeleton for a KPI card (matches dashboard metric cards) */
export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow p-6 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
