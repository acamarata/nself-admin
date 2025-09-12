'use client'

import { suppressAbortErrors } from '@/utils/errorHandling'
import { useEffect } from 'react'

export function ErrorSuppressor() {
  useEffect(() => {
    // Suppress AbortError messages in the console
    suppressAbortErrors()

    // Note: We don't restore on cleanup because we want this
    // to remain active for the entire app lifecycle
  }, [])

  return null
}
