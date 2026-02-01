'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ListSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Clean up unused resources" />
}

export default function Page() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Content />
    </Suspense>
  )
}
