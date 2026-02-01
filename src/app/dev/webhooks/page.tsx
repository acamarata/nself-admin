'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ListSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Test and debug webhooks" />
}

export default function Page() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <Content />
    </Suspense>
  )
}
