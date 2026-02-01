'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { TableSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Manage system snapshots" />
}

export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <Content />
    </Suspense>
  )
}
