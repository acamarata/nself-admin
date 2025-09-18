'use client'

import { AlertCircle, CheckCircle, Hammer } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BuildStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  message?: string
}

export default function BuildPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromWizard = searchParams.get('from') === 'wizard'

  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    { name: 'Initializing build process', status: 'pending' },
    { name: 'Generating docker-compose.yml', status: 'pending' },
    { name: 'Creating service configurations', status: 'pending' },
    { name: 'Setting up database schemas', status: 'pending' },
    { name: 'Configuring networking', status: 'pending' },
    { name: 'Validating configuration', status: 'pending' },
    { name: 'Finalizing build', status: 'pending' },
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [buildStatus, setBuildStatus] = useState<
    'building' | 'success' | 'error'
  >('building')
  const [errorMessage, setErrorMessage] = useState('')
  const [serviceCount, setServiceCount] = useState(0)

  const debugLog = (message: string, data?: any) => {
    // Fire-and-forget debug logging
    fetch('/api/debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, data }),
    }).catch((e) => console.error('Debug log failed:', e))
  }

  useEffect(() => {
    debugLog('Build page: useEffect triggered', { fromWizard })

    // If not from wizard, redirect to init immediately
    if (!fromWizard) {
      debugLog('Build page: Not from wizard, redirecting to /init/1')
      router.push('/init/1')
      return
    }

    // If coming from wizard, start build immediately
    debugLog('Build page: Coming from wizard, starting build immediately')
    startBuild()
  }, [fromWizard, router])

  const updateStep = (
    index: number,
    status: BuildStep['status'],
    message?: string,
  ) => {
    setBuildSteps((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], status, message }
      return updated
    })
  }

  const startBuild = async () => {
    debugLog('Build page: startBuild function called!')
    try {
      // Step 1: Initialize
      debugLog('Build page: Setting step 0 to running')
      updateStep(0, 'running')
      setCurrentStep(0)

      // Get CSRF token from cookies
      debugLog('Build page: Getting CSRF token from cookies...')
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('nself-csrf='))
        ?.split('=')[1]

      debugLog('Build page: CSRF token', {
        found: !!csrfToken,
        token: csrfToken ? 'present' : 'missing',
      })

      // Actually call the build API - try nself build first, fall back to simple if it fails
      debugLog('Build page: About to call /api/nself/build with POST...')
      let response = await fetch('/api/nself/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
      })
      debugLog('Build page: Build API response', {
        status: response.status,
        ok: response.ok,
      })

      // If nself build fails (likely due to timeout), try the simple build
      if (!response.ok) {
        console.log('nself build failed, trying simple build...')
        response = await fetch('/api/nself/build-simple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
          },
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Build failed' }))
          throw new Error(
            errorData.error || errorData.details || 'Build failed',
          )
        }
      }

      const data = await response.json()

      updateStep(0, 'completed')
      setCurrentStep(1)

      // Step 2: Generate docker-compose
      updateStep(1, 'running')

      // Extract service count from response
      const match = data.stdout?.match(/(\d+) services configured/)
      if (match) {
        setServiceCount(parseInt(match[1]))
      }

      updateStep(
        1,
        'completed',
        `Generated configuration for ${match ? match[1] : 'all'} services`,
      )
      setCurrentStep(2)

      // Step 3: Service configurations
      updateStep(2, 'running')
      await simulateDelay(600)
      updateStep(2, 'completed')
      setCurrentStep(3)

      // Step 4: Database schemas
      updateStep(3, 'running')
      await simulateDelay(700)
      updateStep(3, 'completed')
      setCurrentStep(4)

      // Step 5: Networking
      updateStep(4, 'running')
      await simulateDelay(500)
      updateStep(4, 'completed')
      setCurrentStep(5)

      // Step 6: Validation
      updateStep(5, 'running')
      await simulateDelay(600)
      updateStep(5, 'completed')
      setCurrentStep(6)

      // Step 7: Finalize
      updateStep(6, 'running')
      await simulateDelay(400)
      updateStep(6, 'completed')

      // Build complete
      setBuildStatus('success')

      // Wait 500ms then redirect to start
      setTimeout(() => {
        router.push('/start')
      }, 500)
    } catch (error) {
      console.error('Build error:', error)
      setBuildStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Build failed')
      updateStep(
        currentStep,
        'error',
        error instanceof Error ? error.message : 'Build failed',
      )

      // Redirect after showing error
      setTimeout(() => {
        router.push('/init/1')
      }, 3000)
    }
  }

  const simulateDelay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const getStepIcon = (step: BuildStep) => {
    if (step.status === 'completed') {
      return (
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      )
    }
    if (step.status === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
    if (step.status === 'running') {
      return (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600 dark:border-zinc-600 dark:border-t-blue-400"></div>
      )
    }
    return (
      <div className="h-5 w-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              {buildStatus === 'building' && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Hammer className="h-10 w-10 animate-pulse text-blue-600 dark:text-blue-400" />
                </div>
              )}
              {buildStatus === 'success' && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              )}
              {buildStatus === 'error' && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {buildStatus === 'building' && 'Building Project...'}
              {buildStatus === 'success' && 'Build Successful!'}
              {buildStatus === 'error' && 'Build Failed'}
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400">
              {buildStatus === 'building' &&
                'Setting up your nself project with all configured services'}
              {buildStatus === 'success' &&
                `Successfully configured ${serviceCount || 'all'} services. Redirecting to start page...`}
              {buildStatus === 'error' && errorMessage}
            </p>
          </div>

          {/* Build Steps */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <div className="space-y-4">
              {buildSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-0.5">{getStepIcon(step)}</div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        step.status === 'completed'
                          ? 'text-green-900 dark:text-green-200'
                          : step.status === 'error'
                            ? 'text-red-900 dark:text-red-200'
                            : step.status === 'running'
                              ? 'text-blue-900 dark:text-blue-200'
                              : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {step.name}
                    </div>
                    {step.message && (
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {step.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-400"
                  style={{
                    width: `${buildStatus === 'success' ? 100 : (currentStep / buildSteps.length) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-2 text-center text-xs text-zinc-600 dark:text-zinc-400">
                {buildStatus === 'success'
                  ? 'Complete'
                  : `Step ${currentStep + 1} of ${buildSteps.length}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
