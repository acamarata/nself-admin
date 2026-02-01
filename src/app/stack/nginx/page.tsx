'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { ServiceDetailSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Nginx web server and reverse proxy" />
}

export default function Page() {
  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <Content />
    </Suspense>
  )
}
