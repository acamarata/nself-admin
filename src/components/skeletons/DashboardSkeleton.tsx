import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      aria-label="Loading dashboard..."
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="mt-2 h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
