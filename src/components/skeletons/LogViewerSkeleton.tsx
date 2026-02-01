import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LogViewerSkeletonProps {
  lines?: number
}

export function LogViewerSkeleton({ lines = 25 }: LogViewerSkeletonProps) {
  return (
    <Card aria-label="Loading logs...">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-zinc-950 p-4 font-mono text-sm dark:bg-zinc-900">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="mb-1 flex gap-3">
              <Skeleton className="h-5 w-20 bg-zinc-800" />
              <Skeleton
                className="h-5 bg-zinc-800"
                style={{
                  width: `${Math.random() * 60 + 20}%`,
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
