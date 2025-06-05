import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-48 mb-4 md:mb-0" />
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg mt-6" />
        </div>

        {/* Main content skeleton */}
        <div className="lg:col-span-3">
          <Skeleton className="h-12 w-full mb-4" />
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
