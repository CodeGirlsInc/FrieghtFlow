import { Skeleton, ShipmentCardSkeleton } from '../../../components/ui/skeleton';

export default function MarketplaceLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-72 mt-1" />
      </div>
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShipmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
