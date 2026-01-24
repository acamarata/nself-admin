'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((_registration) => {
            // Intentionally empty - service worker registered
          })
          .catch((_error) => {
            // Intentionally empty - registration failed silently
          })
      })
    }
  }, [])

  return null
}
