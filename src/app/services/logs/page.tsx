'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { LogViewerSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="View logs for all services" />
}
export default function Page() {
  return (
    <Suspense fallback={<LogViewerSkeleton />}>
      <Content />
    </Suspense>
  )
}
