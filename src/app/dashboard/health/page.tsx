'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ChartSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return (
    <PageTemplate description="Monitor the health status of all services" />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <Content />
    </Suspense>
  )
}
