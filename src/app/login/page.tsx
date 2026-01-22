'use client'

import { LoginBackground } from '@/components/LoginBackground'
import { LogoIcon } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { VERSION } from '@/lib/constants'
import { getCorrectRoute } from '@/lib/routing-logic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)
  const router = useRouter()
  const { login } = useAuth()

  // Check if password needs to be set up
  useEffect(() => {
    const checkPasswordSetup = async () => {
      try {
        const response = await fetch('/api/auth/init')
        const data = await response.json()
        setIsSetupMode(!data.passwordExists)
      } catch (error) {
        console.error('Error checking password setup:', error)
      } finally {
        setIsCheckingSetup(false)
      }
    }

    checkPasswordSetup()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (isSetupMode) {
      // Setup mode - set the password
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      if (password.length < 3) {
        setError('Password must be at least 3 characters')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })

        const data = await response.json()

        if (response.ok) {
          // Password set successfully, now login
          const success = await login(password)
          if (success) {
            // Use centralized routing logic
            const routingResult = await getCorrectRoute()
            console.log('Post-setup routing:', routingResult.reason)
            router.push(routingResult.route)
          } else {
            setError('Password set but login failed. Please try again.')
            setIsSetupMode(false)
          }
        } else {
          setError(data.error || 'Failed to set password')
        }
      } catch (error) {
        setError('Failed to set password. Please try again.')
      }
    } else {
      // Normal login mode
      const success = await login(password)

      if (success) {
        // Use centralized routing logic
        const routingResult = await getCorrectRoute()
        console.log('Post-login routing:', routingResult.reason)
        router.push(routingResult.route)
      } else {
        setError('Invalid password')
        setPassword('')
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Non-pixelated pulsating blue background */}
      <LoginBackground />

      {/* Login Box with tilted underbox */}
      <div className="relative z-20 w-full max-w-md px-6">
        {/* Tilted navy underbox with glow - narrower width, rotated 10° right, darker blue */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-950 to-black shadow-2xl"
          style={{
            transform: 'rotate(10deg) scaleX(0.9) scaleY(0.95)',
            boxShadow:
              '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
          }}
        />

        {/* Main login box */}
        <div className="relative rounded-2xl border border-blue-500/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl dark:bg-zinc-900/95">
          {/* Logo and Title */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <LogoIcon className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {isSetupMode ? 'Welcome to nAdmin' : 'nAdmin'}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {isSetupMode
                ? 'Set your admin password. To reset, delete it from .env file.'
                : 'Enter your admin password to continue'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-500/20 bg-white/50 px-4 py-4 text-zinc-900 placeholder-zinc-500 shadow-inner backdrop-blur-sm transition-all focus:border-blue-500/50 focus:bg-white/70 focus:outline-none dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-400 dark:focus:bg-zinc-800/70"
                placeholder={
                  isSetupMode ? 'Set admin password' : 'Enter admin password'
                }
                required
                autoFocus
                disabled={isCheckingSetup}
              />
            </div>

            {isSetupMode && (
              <div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-blue-500/20 bg-white/50 px-4 py-4 text-zinc-900 placeholder-zinc-500 shadow-inner backdrop-blur-sm transition-all focus:border-blue-500/50 focus:bg-white/70 focus:outline-none dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-400 dark:focus:bg-zinc-800/70"
                  placeholder="Confirm admin password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-10 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                {isLoading
                  ? isSetupMode
                    ? 'Setting up...'
                    : 'Signing in...'
                  : isSetupMode
                    ? 'Set Password'
                    : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-blue-500/10 pt-6">
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              nself Admin v{VERSION}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
