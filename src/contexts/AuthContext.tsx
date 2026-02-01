'use client'

import { useCentralDataStore } from '@/stores/centralDataStore'
import { useProjectStore } from '@/stores/projectStore'
import { useRouter } from 'next/navigation'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      // First check if we have a session cookie at all
      // This avoids making unnecessary API calls that result in 401 errors
      const hasCookie = document.cookie.includes('nself-session')

      if (!hasCookie) {
        // No session cookie, so don't even try to authenticate
        setIsAuthenticated(false)
        return
      }

      // We have a cookie, now check if it's valid
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include', // Include cookies
      })

      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        // Session cookie exists but is invalid or expired
        setIsAuthenticated(false)
      }
    } catch (_error) {
      // Network error - also treat as not authenticated
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    // Check authentication status on mount
    checkAuth().finally(() => {
      setIsLoading(false)
    })
  }, [])

  const login = async (
    password: string,
    rememberMe: boolean = false,
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ password, rememberMe }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsAuthenticated(true)
          return true
        }
      }
      return false
    } catch (_error) {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/login', {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('[AuthContext] Error during logout:', error)
    }

    // SECURITY: Clear all stores on logout to prevent sensitive data persistence
    try {
      useProjectStore.getState().reset()
      useCentralDataStore.getState().reset()
    } catch (error) {
      console.warn('[AuthContext] Error clearing stores:', error)
    }

    setIsAuthenticated(false)
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
