'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { TableSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Import and export data" />
}
export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <Content />
    </Suspense>
  )
}
