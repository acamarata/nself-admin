import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

interface ListSkeletonProps {
  items?: number
}

export function ListSkeleton({ items = 8 }: ListSkeletonProps) {
  return (
    <div className="space-y-1" aria-label="Loading list...">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
            <div className="flex flex-1 items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          {i < items - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}
