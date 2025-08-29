'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginBackground } from '@/components/LoginBackground'
import { LogoIcon } from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'

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
        const response = await fetch('/api/auth/setup')
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
        const response = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        })

        const data = await response.json()

        if (response.ok) {
          // Password set successfully, now login
          const success = await login(password)
          if (success) {
            router.push('/')
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
        router.push('/')
      } else {
        setError('Invalid password')
        setPassword('')
      }
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Non-pixelated pulsating blue background */}
      <LoginBackground />

      {/* Login Box with tilted underbox */}
      <div className="relative z-20 w-full max-w-md px-6">
        {/* Tilted navy underbox with glow - narrower width, rotated 10° right, darker blue */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-950 to-black rounded-2xl shadow-2xl"
          style={{
            transform: 'rotate(10deg) scaleX(0.9) scaleY(0.95)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
          }}
        />
        
        {/* Main login box */}
        <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-blue-500/20">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoIcon className="w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {isSetupMode ? 'Welcome to nAdmin' : 'nAdmin'}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
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
                className="w-full px-4 py-4 border-2 border-blue-500/20 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/70 dark:focus:bg-zinc-800/70 transition-all shadow-inner"
                placeholder={isSetupMode ? "Set admin password" : "Enter admin password"}
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
                  className="w-full px-4 py-4 border-2 border-blue-500/20 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/70 dark:focus:bg-zinc-800/70 transition-all shadow-inner"
                  placeholder="Confirm admin password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base rounded-xl transition-all transform hover:scale-[1.02] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                style={{
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                {isLoading 
                  ? (isSetupMode ? 'Setting up...' : 'Signing in...') 
                  : (isSetupMode ? 'Set Password' : 'Sign In')}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-blue-500/10">
            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
              nself Admin v0.3.9
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}