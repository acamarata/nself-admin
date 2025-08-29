'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { Loader2 } from 'lucide-react'

// Lazy load the heavy services page component
const ServicesContent = dynamic(
  () => import('./page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    ),
    ssr: false // Disable SSR for this component
  }
)

export default function ServicesClient() {
  // The page component handles its own data fetching
  return <ServicesContent />
}