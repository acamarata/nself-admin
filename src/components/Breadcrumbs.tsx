'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

const pathLabels: Record<string, string> = {
  docker: 'Docker',
  containers: 'Containers',
  images: 'Images',
  services: 'Services',
  config: 'Configuration',
  database: 'Database',
  logs: 'Logs',
  monitoring: 'Monitoring',
  settings: 'Settings',
  backup: 'Backup & Restore'
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // Generate breadcrumb items from path
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []
  
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    items.push({ label, href })
  })
  
  if (items.length === 0) return null
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 overflow-x-auto"
    >
      <Link 
        href="/" 
        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex-shrink-0"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center flex-shrink-0">
          <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

// Mobile-responsive breadcrumbs with dropdown for long paths
export function MobileBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) return null
  
  const currentSegment = segments[segments.length - 1]
  const currentLabel = pathLabels[currentSegment] || 
    currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1)
  
  const parentPath = segments.length > 1 ? 
    '/' + segments.slice(0, -1).join('/') : '/'
  
  return (
    <nav className="md:hidden flex items-center space-x-2 text-sm mb-4">
      <Link
        href={parentPath}
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← Back
      </Link>
      <span className="text-gray-500">|</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {currentLabel}
      </span>
    </nav>
  )
}