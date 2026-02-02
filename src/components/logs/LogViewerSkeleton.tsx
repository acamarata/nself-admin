'use client'

export function LogViewerSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex gap-2">
          <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Insights Bar */}
      <div className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1">
            <div className="mb-2 h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ))}
      </div>

      {/* Log Lines */}
      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="h-10 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-10 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-10 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-10 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ))}
      </div>
    </div>
  )
}
