'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Server, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { useProjectStore } from '@/stores/projectStore'
import { GridPattern } from '@/components/GridPattern'
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion'
import { safeNavigate, getTargetRoute, shouldRedirect } from '@/lib/routing'
import type { MotionValue } from 'framer-motion'

interface ProjectInfoCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  pattern: Omit<React.ComponentPropsWithoutRef<typeof GridPattern>, 'width' | 'height' | 'x'>
}

function ProjectInfoIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-blue-400/10 dark:group-hover:ring-blue-400">
      <Icon className="h-4 w-4 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:stroke-zinc-400 dark:group-hover:stroke-blue-400" />
    </div>
  )
}

function ProjectInfoPattern({
  mouseX,
  mouseY,
  ...gridProps
}: ProjectInfoCardProps['pattern'] & {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl mask-[linear-gradient(white,transparent)] transition duration-300 group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/2 stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-blue-900/20 dark:to-blue-800/20"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-blue-400/50 stroke-blue-500/70 dark:fill-blue-400/10 dark:stroke-blue-400/30"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

function ProjectInfoCard({ icon, label, value, pattern }: ProjectInfoCardProps) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <ProjectInfoPattern {...pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 py-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ProjectInfoIcon icon={icon} />
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {label}
            </div>
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StartPage() {
  const router = useRouter()
  const [projectInfo, setProjectInfo] = useState<any>(null)
  const [starting, setStarting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [startProgress, setStartProgress] = useState<{
    message: string
    percentage?: number
    type?: 'status' | 'progress' | 'download' | 'container' | 'error' | 'complete'
  }>({ message: '' })
  
  const checkProjectStatus = useProjectStore(state => state.checkProjectStatus)
  const projectStatus = useProjectStore(state => state.projectStatus)
  
  // Check project status and redirect if needed
  useEffect(() => {
    const checkStatus = async () => {
      // Check project status first
      await checkProjectStatus()
      const currentStatus = useProjectStore.getState().projectStatus
      
      // Determine the correct route based on project state
      const targetRoute = await getTargetRoute(currentStatus)
      const currentPath = window.location.pathname
      
      // Only redirect if we should change routes
      if (shouldRedirect(currentPath, targetRoute)) {
        safeNavigate(router, targetRoute)
      }
    }
    
    // Add delay to prevent bouncing
    const timer = setTimeout(checkStatus, 500)
    return () => clearTimeout(timer)
  }, [checkProjectStatus, router])

  // Fetch project info
  useEffect(() => {
    fetchProjectInfo()
  }, [])

  const fetchProjectInfo = async () => {
    try {
      const res = await fetch('/api/project/info')
      const data = await res.json()
      if (data.success) {
        setProjectInfo(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch project info:', error)
    }
  }

  const startServices = async () => {
    try {
      setStarting(true)
      setStartProgress({ message: 'Initializing Docker services...', type: 'status' })
      
      // Get CSRF token from cookie
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('nself-csrf='))
        ?.split('=')[1]
      
      // Use streaming API for real-time progress
      const response = await fetch('/api/nself/start-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Start failed with status:', response.status)
        console.error('Error response:', errorText)
        throw new Error(`Failed to start services: ${response.status} - ${errorText}`)
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              
              switch (data.type) {
                case 'status':
                  setStartProgress({
                    message: data.message,
                    type: 'status'
                  })
                  break
                  
                case 'progress':
                  setStartProgress({
                    message: data.message,
                    percentage: data.percentage,
                    type: 'progress'
                  })
                  break
                  
                case 'download':
                  setStartProgress({
                    message: data.message,
                    percentage: data.percentage,
                    type: 'download'
                  })
                  break
                  
                case 'container':
                  setStartProgress({
                    message: data.message,
                    type: 'container'
                  })
                  break
                  
                case 'error':
                  setStartProgress({
                    message: `Error: ${data.message}`,
                    type: 'error'
                  })
                  console.error('Start error:', data.message)
                  break
                  
                case 'complete':
                  setStartProgress({
                    message: data.message,
                    percentage: 100,
                    type: 'complete'
                  })
                  // Mark that services were recently started
                  localStorage.setItem('services_recently_started', Date.now().toString())
                  
                  // Wait longer and verify services are actually running before redirect
                  setTimeout(async () => {
                    // Check if services are actually running
                    await checkProjectStatus()
                    const status = useProjectStore.getState().projectStatus
                    if (status === 'running') {
                      safeNavigate(router, '/', true) // Force navigation to dashboard
                    } else {
                      // Services might still be starting, wait a bit more
                      setTimeout(() => {
                        safeNavigate(router, '/', true) // Force navigation to dashboard
                      }, 3000)
                    }
                  }, 3000)
                  break
              }
            } catch (err) {
              console.error('Failed to parse stream data:', err)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to start services:', error)
      setStartProgress({
        message: 'Failed to start services. Please check Docker is running.',
        type: 'error'
      })
    } finally {
      // Keep showing the final message for a bit before clearing
      setTimeout(() => {
        setStarting(false)
        setStartProgress({ message: '' })
      }, 5000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      <HeroPattern />
      
      <div className="relative z-10 max-w-2xl w-full mx-auto px-6">
        <div className="group relative rounded-2xl bg-zinc-50 p-8 dark:bg-white/2.5">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
          <div className="relative text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center dark:bg-blue-500/10">
              <div className="h-6 w-6 rounded-full bg-blue-500" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
              Ready to Launch
            </h2>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Your <span className="font-semibold text-zinc-800 dark:text-zinc-200">{projectInfo?.projectName || 'nself'}</span> project has been successfully built and configured.
              All {projectInfo?.monitoringEnabled ? (projectInfo?.totalServices || 0) + 5 : (projectInfo?.totalServices || 0)} services are ready to start.
            </p>
            
            {projectInfo && (
              <>
                {/* Status Cards */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProjectInfoCard
                    icon={CheckCircle}
                    label="Status"
                    value="Built"
                    pattern={{
                      y: 22,
                      squares: [[0, 1]]
                    }}
                  />
                  <ProjectInfoCard
                    icon={Server}
                    label="Env"
                    value={projectInfo.environment === 'dev' ? 'Dev' : projectInfo.environment === 'production' ? 'Prod' : 'Dev'}
                    pattern={{
                      y: 16,
                      squares: [[0, 1], [1, 3]]
                    }}
                  />
                </div>
                
                {/* Services Breakdown */}
                {/* Additional Info Cards */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-3 border border-blue-200 dark:border-blue-800">
                    <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Base Domain</div>
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-200 mt-1">*.{projectInfo.domain || 'localhost'}</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-3 border border-green-200 dark:border-green-800">
                    <div className="text-xs font-medium text-green-700 dark:text-green-400">Database</div>
                    <div className="text-sm font-semibold text-green-900 dark:text-green-200 mt-1">{projectInfo.databaseName || projectInfo.database || 'PostgreSQL'}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 p-3">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <span>
                        Total Services: <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {projectInfo?.monitoringEnabled ? (projectInfo?.totalServices || 0) + 5 : (projectInfo?.totalServices || 0)}
                        </span>
                      </span>
                      {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {showDetails && (
                    <div className="space-y-1.5 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      {/* Required Services */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-zinc-600 dark:text-zinc-400">Required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {projectInfo.servicesByCategory?.required?.length || 
                             projectInfo.services?.filter((s: string) => 
                              ['postgres', 'hasura', 'auth', 'nginx'].some(req => s.toLowerCase().includes(req))
                            ).length || 4}
                          </span>
                          <span className="text-xs text-zinc-500">
                            (PostgreSQL, Hasura, Auth, Nginx)
                          </span>
                        </div>
                      </div>
                      
                      {/* Optional Services */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-zinc-600 dark:text-zinc-400">Optional</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {(() => {
                              const baseOptional = projectInfo.servicesByCategory?.optional?.length || 
                                projectInfo.services?.filter((s: string) => 
                                  ['redis', 'minio', 'storage', 'mailpit', 'mlflow'].some(opt => s.toLowerCase().includes(opt))
                                ).length || 0;
                              // Add 5 if monitoring is enabled (even if services aren't built yet)
                              return projectInfo.monitoringEnabled ? baseOptional + 5 : baseOptional;
                            })()}
                          </span>
                          <span className="text-xs text-zinc-500">
                            ({projectInfo.monitoringEnabled ? 'Monitoring Bundle, ' : ''}Redis, MinIO, Storage, MLflow, Mailpit)
                          </span>
                        </div>
                      </div>
                      
                      {/* Custom Services */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          <span className="text-zinc-600 dark:text-zinc-400">Custom Services</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {projectInfo.servicesByCategory?.user?.filter((s: string) => s !== 'nself').length || 
                             projectInfo.services?.filter((s: string) => 
                              !['postgres', 'hasura', 'auth', 'nginx', 'redis', 'minio', 'storage', 'mailpit', 'mlflow', 'grafana', 'prometheus', 'loki', 'jaeger', 'alertmanager'].some(known => s.toLowerCase().includes(known))
                            ).length || 0}
                          </span>
                          <span className="text-xs text-zinc-500">
                            (Custom backend services)
                          </span>
                        </div>
                      </div>
                      
                      {/* Frontend Apps */}
                      {projectInfo.frontendApps && projectInfo.frontendApps.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            <span className="text-zinc-600 dark:text-zinc-400">Frontend Apps</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-zinc-900 dark:text-white">
                              {projectInfo.frontendApps.length}
                            </span>
                            <span className="text-xs text-zinc-500">
                              ({projectInfo.frontendApps.map((app: any) => app.label).join(', ')})
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Backup Status - inline, compact */}
                      {projectInfo.backupEnabled && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-zinc-600 dark:text-zinc-400">Backups</span>
                          </div>
                          <span className="text-xs text-zinc-500">
                            Enabled ({projectInfo.backupSchedule || 'Daily 2AM'})
                          </span>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="mt-6">
              <div className="flex flex-col items-center space-y-3">
                <Button 
                  onClick={startServices}
                  variant="primary"
                  disabled={starting}
                  className="px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  {starting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting Services...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Launch All Services
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center leading-tight">
                  This will start all {projectInfo?.monitoringEnabled ? (projectInfo?.totalServices || 0) + 5 : (projectInfo?.totalServices || 0)} services using Docker Compose<br />
                  using <span className="font-medium">nself start</span> with smart defaults and auto-fixer.
                </p>
                
                {/* Edit/Reset Options */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => safeNavigate(router, '/init/1', true)} 
                    className="text-sm px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Build
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('This will completely reset your project and delete all configuration. Are you sure?')) {
                        safeNavigate(router, '/init/reset', true) // Force navigation to reset
                      }
                    }}
                    className="text-sm px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Project
                  </button>
                </div>
                
                {/* Progress Message */}
                {startProgress.message && (
                  <div className="text-center space-y-2 max-w-md">
                    <p className={`text-sm font-medium ${
                      startProgress.type === 'error' 
                        ? 'text-red-600 dark:text-red-400'
                        : startProgress.type === 'complete'
                        ? 'text-green-600 dark:text-green-400'
                        : startProgress.type === 'download'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {startProgress.message}
                    </p>
                    
                    {/* Progress Bar */}
                    {startProgress.percentage !== undefined && startProgress.percentage > 0 && (
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${startProgress.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}