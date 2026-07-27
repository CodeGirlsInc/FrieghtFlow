import { Skeleton, UserTableRowSkeleton } from '../../../../components/ui/skeleton';

export default function AdminUsersLoading() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-32 mt-1" />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 border border-border rounded-md overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-none" />
          ))}
        </div>
        <div className="flex gap-1 border border-border rounded-md overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-none" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card shadow">
        <div className="p-6 pb-2 space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="p-0">
          <div className="border-b border-border bg-muted/50">
            <div className="grid grid-cols-6 gap-4 px-4 py-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <UserTableRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
