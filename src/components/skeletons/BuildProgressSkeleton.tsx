import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function BuildProgressSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-4xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
            <Skeleton className="mx-auto mb-2 h-8 w-64" />
            <Skeleton className="mx-auto h-4 w-96" />
          </div>

          {/* Build Progress Card */}
          <Card>
            <CardHeader className="border-b">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Build Steps */}
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs Card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-zinc-950 p-4 font-mono text-sm dark:bg-black">
                {Array.from({ length: 15 }).map((_, i) => (
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
        </div>
      </div>
    </div>
  )
}
