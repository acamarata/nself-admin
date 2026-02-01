'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ChartSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return (
    <PageTemplate description="Real-time status of all system components" />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <Content />
    </Suspense>
  )
}
