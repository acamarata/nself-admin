'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { FormSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return (
    <PageTemplate
      title="CORS Configuration"
      description="Configure Cross-Origin Resource Sharing"
    />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Content />
    </Suspense>
  )
}
