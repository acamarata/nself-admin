import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CodeEditorSkeleton() {
  return (
    <Card aria-label="Loading code editor...">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
          {/* Line numbers */}
          <div className="w-12 border-r bg-zinc-50 p-4 dark:bg-zinc-900">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="mb-1 h-5 w-6" />
            ))}
          </div>
          {/* Code content */}
          <div className="flex-1 p-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                key={i}
                className="mb-1 h-5"
                style={{
                  width: `${Math.random() * 40 + 40}%`,
                  marginLeft: `${(i % 3) * 16}px`,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
