'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { FormSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Configure email service providers" />
}

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Content />
    </Suspense>
  )
}
