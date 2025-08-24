// Simple skeleton loader component for instant page loads
export function Skeleton({ 
  className = '', 
  width, 
  height 
}: { 
  className?: string
  width?: string | number
  height?: string | number 
}) {
  return (
    <div 
      className={`animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900/50 overflow-hidden border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}