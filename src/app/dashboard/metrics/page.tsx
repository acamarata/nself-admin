'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ChartSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return (
    <PageTemplate description="View detailed performance metrics and analytics" />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <Content />
    </Suspense>
  )
}
