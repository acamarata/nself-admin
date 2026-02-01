'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ServiceDetailSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Manage custom user services" />
}

export default function Page() {
  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <Content />
    </Suspense>
  )
}
