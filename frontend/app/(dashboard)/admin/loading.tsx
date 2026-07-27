import { Skeleton, StatsCardSkeleton } from '../../../components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-40 mt-1" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton />
      </div>
    </div>
  );
}
