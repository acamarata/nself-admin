'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { DashboardSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Advanced system diagnostics" />
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Content />
    </Suspense>
  )
}
