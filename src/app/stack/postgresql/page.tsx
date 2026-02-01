'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ServiceDetailSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="PostgreSQL database service management" />
}

export default function Page() {
  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <Content />
    </Suspense>
  )
}
