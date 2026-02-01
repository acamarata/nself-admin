'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ListSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Real-time monitoring dashboard" />
}

export default function Page() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Content />
    </Suspense>
  )
}
