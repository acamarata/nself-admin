'use client'

// Minimal wrapper that loads instantly
// The actual heavy component is lazy-loaded after mount

import { Suspense, lazy } from 'react'

// Lazy load the actual page component
const ServicesPage = lazy(() => import('./ServicesPageContent'))

export default function ServicesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ServicesPage />
    </Suspense>
  )
}