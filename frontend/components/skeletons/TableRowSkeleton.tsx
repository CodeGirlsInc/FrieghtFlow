import { Skeleton } from "../ui/skeleton";

interface TableRowSkeletonProps {
  columns?: number;
}

/** Generic skeleton for a data table row with configurable columns */
export function TableRowSkeleton({ columns = 5 }: TableRowSkeletonProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 flex-1 ${i === 0 ? "w-28" : "w-32"}`}
        />
      ))}
    </div>
  );
}
