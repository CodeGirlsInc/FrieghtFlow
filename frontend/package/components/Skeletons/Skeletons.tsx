const base = 'animate-pulse rounded bg-gray-200';

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`${base} h-4 w-full ${className}`} />;
}

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`${base} ${className}`} />;
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <div className={`${base} rounded-full`} style={{ width: size, height: size }} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-3/4" />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonText />
        <SkeletonText className="w-5/6" />
        <SkeletonText className="w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonText key={i} className="h-3 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonText key={c} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonShipmentCard() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
      <SkeletonText className="w-1/3 h-3" />
      <SkeletonText className="w-2/3" />
      <div className="flex justify-between">
        <SkeletonText className="w-1/4" />
        <SkeletonText className="w-1/5" />
      </div>
    </div>
  );
}
