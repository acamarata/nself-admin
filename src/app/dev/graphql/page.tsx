'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { CodeEditorSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return (
    <PageTemplate description="Interactive GraphQL development environment" />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<CodeEditorSkeleton />}>
      <Content />
    </Suspense>
  )
}
