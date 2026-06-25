import { Skeleton } from "../ui/skeleton";

/** Skeleton for a profile section (avatar + text lines) */
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}
