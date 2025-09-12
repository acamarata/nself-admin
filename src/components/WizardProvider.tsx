'use client'

import { useWizardStore } from '@/stores/wizardStore'
import { useEffect } from 'react'

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const { syncWithEnv, isInitialized, setInitialized } = useWizardStore()

  useEffect(() => {
    // Load state from env on initial mount
    if (!isInitialized) {
      syncWithEnv().then(() => {
        setInitialized(true)
      })
    }
  }, [isInitialized, syncWithEnv, setInitialized])

  return <>{children}</>
}
