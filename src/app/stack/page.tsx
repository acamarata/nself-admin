'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { CardGridSkeleton } from '@/components/skeletons'
import { Suspense } from 'react'

function Content() {
  return <PageTemplate description="Manage all core stack services" />
}

export default function Page() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <Content />
    </Suspense>
  )
}
