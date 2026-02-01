'use client'

import { Suspense } from 'react'
import { TableSkeleton } from '@/components/skeletons'
import { PageTemplate } from '@/components/PageTemplate'

function Content() {
  return (
    <PageTemplate 
     
      description="Import and export data"
    />
  )
}
export default function Page() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <Content />
    </Suspense>
  )
}
