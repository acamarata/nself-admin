'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Server, CheckCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { useProjectStore } from '@/stores/projectStore'
import { GridPattern } from '@/components/GridPattern'
import { useMotionValue, motion, useMotionTemplate } from 'framer-motion'
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
  const [startProgress, setStartProgress] = useState<{
    message: string
    percentage?: number
    type?: 'status' | 'progress' | 'download' | 'container' | 'error' | 'complete'
  }>({ message: '' })
  
  const checkProjectStatus = useProjectStore(state => state.checkProjectStatus)
  const projectStatus = useProjectStore(state => state.projectStatus)
  
  // Check if services are already running
  useEffect(() => {
    checkProjectStatus().then(() => {
      const currentStatus = useProjectStore.getState().projectStatus
      if (currentStatus === 'running') {
        // Services are running, redirect to dashboard
        router.push('/')
      }
    })
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
      
      // Use streaming API for real-time progress
      const response = await fetch('/api/nself/start-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to start services')
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
                  // Redirect to dashboard after completion
                  setTimeout(() => {
                    router.push('/')
                  }, 2000)
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
            <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
              Services Not Running
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Your nself project is configured but services are not currently running. 
              {projectInfo?.projectName && ` Project: ${projectInfo.projectName}`}
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
                    label="Total Services"
                    value={projectInfo.services?.length || 0}
                    pattern={{
                      y: 16,
                      squares: [[0, 1], [1, 3]]
                    }}
                  />
                </div>
                
                {/* Services Breakdown */}
                <div className="mt-4">
                  <div className="rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 p-4">
                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Service Categories</h3>
                    <div className="space-y-2">
                      {/* Required Services */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-zinc-600 dark:text-zinc-400">Required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {projectInfo.services?.filter((s: string) => 
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
                            {projectInfo.services?.filter((s: string) => 
                              ['redis', 'minio', 'mailpit', 'grafana', 'prometheus', 'loki', 'jaeger', 'alertmanager'].some(opt => s.toLowerCase().includes(opt))
                            ).length || 8}
                          </span>
                          <span className="text-xs text-zinc-500">
                            (Redis, MinIO, Monitoring Stack)
                          </span>
                        </div>
                      </div>
                      
                      {/* User Services */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          <span className="text-zinc-600 dark:text-zinc-400">User Services</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {projectInfo.services?.filter((s: string) => 
                              ['nest', 'bull', 'python', 'go'].some(user => s.toLowerCase().includes(user))
                            ).length || 9}
                          </span>
                          <span className="text-xs text-zinc-500">
                            (NestJS, BullMQ, Python, Go)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-8">
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={startServices}
                  variant="primary"
                  disabled={starting}
                  className="px-8 py-3"
                >
                  {starting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Starting Services...
                    </>
                  ) : (
                    'Start Services'
                  )}
                </Button>
                
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