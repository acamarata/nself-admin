'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeroPattern } from '@/components/HeroPattern'
import { ProgressSteps } from './ProgressSteps'
import { ThemeToggle } from '@/components/ThemeToggle'
import { RotateCcw, LogOut } from 'lucide-react'

interface StepWrapperProps {
  children: React.ReactNode
}

export function StepWrapper({ children }: StepWrapperProps) {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the wizard? This will clear all progress and start over.')) {
      // Clear all wizard state
      localStorage.removeItem('wizard_visited_steps')
      localStorage.removeItem('wizard_environment')
      localStorage.removeItem('wizard_step1_cache')
      // Navigate to reset page which will handle the actual reset
      router.push('/init/reset')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <>
      <HeroPattern />
      
      <div className="relative min-h-screen">
        {/* Action buttons - fixed at top on mobile, inline on desktop */}
        <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-2 sm:hidden">
          {/* Dark/Light mode toggle */}
          <ThemeToggle />
          
          {/* Reset button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-2 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-red-600 py-1 px-2 text-white hover:bg-red-700 dark:bg-red-500/10 dark:text-red-400 dark:ring-1 dark:ring-inset dark:ring-red-400/20 dark:hover:bg-red-400/10 dark:hover:text-red-300 dark:hover:ring-red-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12 sm:pt-8">
          {/* Header with gradient text and desktop controls */}
          <div className="relative">
            <div className="text-center mb-6">
              <h1 className="text-4xl/tight font-extrabold bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent sm:text-5xl/tight dark:from-blue-400 dark:to-white">
                Initial Setup Wizard
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">
                Configure your nself project in 6 simple steps
              </p>
            </div>
            
            {/* Desktop controls - positioned beside title */}
            <div className="hidden sm:flex absolute top-0 right-0 items-center gap-2">
              {/* Dark/Light mode toggle */}
              <ThemeToggle />
              
              {/* Reset button */}
              <button
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-400/20 dark:hover:bg-zinc-400/10 dark:hover:text-zinc-300 dark:hover:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-full bg-red-600 py-1 px-3 text-white hover:bg-red-700 dark:bg-red-500/10 dark:text-red-400 dark:ring-1 dark:ring-inset dark:ring-red-400/20 dark:hover:bg-red-400/10 dark:hover:text-red-300 dark:hover:ring-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          
          {/* Progress Steps - no wrapper needed */}
          <ProgressSteps />
          
          {/* Content Card with better transparency */}
          <div className="mt-6 group relative rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:hover:shadow-black/5">
            {/* Ring border */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/10 ring-inset dark:ring-white/10" />
            
            {/* Content */}
            <div className="relative rounded-2xl p-8">
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}