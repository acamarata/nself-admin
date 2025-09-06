'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function InitReset() {
  const router = useRouter()
  const [status, setStatus] = useState<'resetting' | 'success' | 'error'>('resetting')
  const [message, setMessage] = useState('Resetting project to blank state...')
  const [errorMessage, setErrorMessage] = useState('')
  const [details, setDetails] = useState<string[]>([])

  useEffect(() => {
    handleReset()
  }, [])

  const handleReset = async () => {
    try {
      // Show initial steps
      setMessage('Preparing to reset project...')
      setDetails(['Starting reset process...'])
      
      // Simulate step-by-step progress
      await new Promise(resolve => setTimeout(resolve, 500))
      setDetails(['✓ Starting reset process', 'Stopping services...'])
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setDetails(['✓ Starting reset process', '✓ Stopping services', 'Removing Docker volumes...'])
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setDetails(['✓ Starting reset process', '✓ Stopping services', '✓ Removing Docker volumes', 'Backing up configuration...'])
      
      // Clear localStorage for wizard steps
      localStorage.removeItem('wizard_visited_steps')
      
      // Call the reset API
      const response = await fetch('/api/wizard/reset', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Show final steps
        await new Promise(resolve => setTimeout(resolve, 500))
        setDetails([
          '✓ Starting reset process', 
          '✓ Stopping services', 
          '✓ Removing Docker volumes', 
          '✓ Backing up configuration',
          'Creating fresh environment files...'
        ])
        
        await new Promise(resolve => setTimeout(resolve, 500))
        setDetails([
          '✓ Starting reset process',
          '✓ Stopping services',
          '✓ Removing Docker volumes', 
          '✓ Backing up configuration',
          '✓ Creating fresh environment files'
        ])
        
        setStatus('success')
        setMessage('Project reset successfully!')
        
        // Wait 1.5 seconds then redirect to step 1
        setTimeout(() => {
          router.push('/init/1')
        }, 1500)
      } else {
        const data = await response.json()
        setStatus('error')
        setErrorMessage(data.error || 'Failed to reset project')
        setMessage('Reset failed')
        
        // Redirect to init page after showing error
        setTimeout(() => {
          router.push('/init')
        }, 2000)
      }
    } catch (error) {
      console.error('Error resetting project:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
      setMessage('Reset failed')
      
      setTimeout(() => {
        router.push('/init')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Icon/Spinner */}
          <div className="mb-6 flex justify-center">
            {status === 'resetting' && (
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400"></div>
            )}
            {status === 'success' && (
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Message */}
          <h2 className={`text-lg font-medium ${
            status === 'error' ? 'text-red-900 dark:text-red-200' : 'text-zinc-900 dark:text-white'
          }`}>
            {message}
          </h2>
          
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}
          
          {/* Show progress details */}
          {details.length > 0 && (
            <div className="mt-4 space-y-1 text-left max-w-sm mx-auto">
              {details.map((detail, index) => (
                <p 
                  key={index} 
                  className={`text-sm transition-all duration-300 ${
                    detail.startsWith('✓') 
                      ? 'text-green-600 dark:text-green-400 font-medium' 
                      : detail.endsWith('...') 
                        ? 'text-blue-600 dark:text-blue-400 animate-pulse'
                        : 'text-zinc-500 dark:text-zinc-500'
                  }`}
                >
                  {detail}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}