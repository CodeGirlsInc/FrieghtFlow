import { Skeleton } from "../ui/skeleton";

/** Skeleton for a notification item/row */
export function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b last:border-b-0">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
