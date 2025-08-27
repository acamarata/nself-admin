import React from 'react'
import * as Icons from '@/lib/icons'

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Icons.Loader2 className="w-full h-full animate-spin text-blue-500" />
    </div>
  )
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg h-48"></div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center space-x-4 p-4">
      <div className="rounded-full bg-zinc-200 dark:bg-zinc-800 h-10 w-10"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mr-4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mr-4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mr-4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  )
}

// Loading wrapper with automatic state management
export function LoadingWrapper({
  loading,
  error,
  children,
  skeleton,
  retry
}: {
  loading: boolean
  error?: Error | null
  children: React.ReactNode
  skeleton?: React.ReactNode
  retry?: () => void
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Icons.AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          {error.message || 'An error occurred'}
        </p>
        {retry && (
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        )}
      </div>
    )
  }
  
  if (loading) {
    return <>{skeleton || <Spinner size="lg" className="mx-auto my-8" />}</>
  }
  
  return <>{children}</>
}