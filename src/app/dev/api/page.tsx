'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { CodeEditorSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Explore and test API endpoints" />
}

export default function Page() {
  return (
    <Suspense fallback={<CodeEditorSkeleton />}>
      <Content />
    </Suspense>
  )
}
