'use client'

/**
 * SSE Provider Component
 * Initializes and manages the SSE stream connection at the app level
 */

import { useEffect } from 'react'
import { useSSEStream } from '@/hooks/useSSEStream'
import { Circle, RefreshCw, WifiOff } from 'lucide-react'

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const { connected, reconnecting, error, lastUpdate, refresh, reconnect } = useSSEStream()
  
  return (
    <>
      {children}
      
      {/* Compact connection status indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={!connected && !reconnecting ? reconnect : undefined}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-md backdrop-blur-sm
            transition-all duration-200 hover:shadow-lg
            ${connected 
              ? 'bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 cursor-default' 
              : reconnecting
              ? 'bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/30 cursor-default'
              : 'bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 hover:bg-red-500/20 dark:hover:bg-red-500/30 cursor-pointer'
            }
          `}
          title={
            connected 
              ? `Connected${lastUpdate > 0 ? ` • Last update: ${new Date(lastUpdate).toLocaleTimeString()}` : ''}`
              : reconnecting 
              ? 'Reconnecting...' 
              : `Disconnected${error ? ` • ${error}` : ''} • Click to retry`
          }
        >
          {/* Status icon */}
          {connected ? (
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          ) : reconnecting ? (
            <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" />
          )}
          
          {/* Status text */}
          <span className={`text-xs font-medium ${
            connected 
              ? 'text-green-700 dark:text-green-300' 
              : reconnecting
              ? 'text-yellow-700 dark:text-yellow-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {connected ? 'Connected' : reconnecting ? 'Reconnecting' : 'Disconnected'}
          </span>
        </button>
      </div>
    </>
  )
}