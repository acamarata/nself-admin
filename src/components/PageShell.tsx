'use client'

import { ReactNode } from 'react'
import { HeroPattern } from '@/components/HeroPattern'
import { Loader2 } from 'lucide-react'

interface PageShellProps {
  title: string
  description?: string
  children: ReactNode
  loading?: boolean
  error?: string | null
  actions?: ReactNode
}

/**
 * PageShell - Best practice component for instant page rendering
 * 
 * PRINCIPLES:
 * 1. Renders immediately with title/description
 * 2. Shows loading skeleton for data areas
 * 3. Never blocks on data fetching
 * 4. Gracefully handles errors
 */
export function PageShell({ 
  title, 
  description, 
  children, 
  loading = false,
  error = null,
  actions
}: PageShellProps) {
  return (
    <>
      <HeroPattern />
      
      <div className="max-w-7xl mx-auto">
        {/* Header - Always renders instantly */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{title}</h1>
              {description && (
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        {error ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  )
}

/**
 * DataSection - Wrapper for async data sections
 * Shows skeleton while loading, content when ready
 */
export function DataSection({ 
  loading, 
  children,
  skeleton,
  className = ""
}: { 
  loading: boolean
  children: ReactNode
  skeleton?: ReactNode
  className?: string
}) {
  if (loading) {
    return skeleton || <DefaultSkeleton className={className} />
  }
  
  return <div className={className}>{children}</div>
}

/**
 * Default skeleton loader
 */
function DefaultSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
    </div>
  )
}

/**
 * Card skeleton for grid layouts
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
    </div>
  )
}