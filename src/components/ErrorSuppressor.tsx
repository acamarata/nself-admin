'use client'

import { useEffect } from 'react'
import { suppressAbortErrors } from '@/utils/errorHandling'

export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress AbortError messages in the console
    suppressAbortErrors()
    
    // Note: We don't restore on cleanup because we want this
    // to remain active for the entire app lifecycle
  }, [])
  
  return null
}