'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { LogViewerSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Browse and filter system activity logs" />
}
export default function Page() {
  return (
    <Suspense fallback={<LogViewerSkeleton />}>
      <Content />
    </Suspense>
  )
}
