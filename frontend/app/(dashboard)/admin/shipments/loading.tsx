import { Skeleton } from '../../../../components/ui/skeleton';

export default function AdminShipmentsLoading() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-36 mt-1" />
      </div>
      <div className="flex gap-1 flex-wrap border-b border-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-16 rounded" />
        ))}
      </div>
      <div className="rounded-xl border bg-card shadow">
        <div className="p-6 pb-2 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="p-0">
          <div className="border-b border-border bg-muted/50">
            <div className="grid grid-cols-8 gap-4 px-4 py-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 items-center px-4 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12 rounded-md ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
