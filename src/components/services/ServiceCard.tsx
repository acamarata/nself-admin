'use client'

import { useState } from 'react'
import * as Icons from '@/lib/icons'

interface Container {
  id: string
  name: string
  image: string
  state: string
  status: string
  health?: 'healthy' | 'unhealthy' | 'starting' | 'stopped'
  ports?: { private: number; public: number; type: string }[]
  labels?: Record<string, string>
  created: number
  serviceType: string
  category: 'stack' | 'services'
  stats?: {
    cpu: { percentage: number; cores: number }
    memory: { usage: number; limit: number; percentage: number }
    network: { rx: number; tx: number }
    blockIO: { read: number; write: number }
    disk?: { used: number; total: number; percentage: number }
  }
  details?: {
    env: string[]
    mounts: any[]
    networkMode: string
    restartPolicy: any
    healthcheck: any
    labels: Record<string, string>
    command: string[]
  }
}

function getServiceUrl(container: Container): string | null {
  if (!container.ports || container.ports.length === 0) return null
  const primaryPort = container.ports.find(p => p.public)
  if (!primaryPort) return null
  return `http://localhost:${primaryPort.public}`
}

export function ServiceCard({ 
  container, 
  onAction,
  getServiceIcon,
  getHealthColor,
  getHealthText 
}: { 
  container: Container
  onAction: (action: string, containerId: string) => void
  getServiceIcon: (name: string) => any
  getHealthColor: (health: string) => string
  getHealthText: (health: string) => string
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  
  const displayName = container.name.replace(/^nself[-_]/, '').replace(/_/g, '-')
  const ServiceIcon = getServiceIcon(container.name)
  const healthColor = getHealthColor(container.health || 'stopped')
  const healthText = getHealthText(container.health || 'stopped')
  const serviceUrl = getServiceUrl(container)
  const primaryPort = container.ports?.find(p => p.public)
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 p-4 hover:ring-blue-400 dark:hover:ring-blue-600 transition-all">
      <div className="mb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
              <ServiceIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{displayName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${healthColor}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {healthText}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(container.created * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              {showDetails ? <Icons.ChevronDown className="w-4 h-4" /> : <Icons.ChevronRight className="w-4 h-4" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <Icons.MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-20">
                    <button
                      onClick={() => {
                        onAction('logs', container.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Icons.FileText className="w-4 h-4" />
                      View Logs
                    </button>
                    <button
                      onClick={() => {
                        onAction('inspect', container.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Icons.Eye className="w-4 h-4" />
                      Inspect
                    </button>
                    <button
                      onClick={() => {
                        onAction('terminal', container.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2"
                    >
                      <Icons.Terminal className="w-4 h-4" />
                      Terminal
                    </button>
                    <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                    <button
                      onClick={() => {
                        onAction('remove', container.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                      <Icons.Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono truncate" title={container.image}>
            {container.image.split(':')[0].split('/').pop()}:{container.image.split(':')[1] || 'latest'}
          </span>
        </div>
      </div>
      
      {/* Resource Usage */}
      {container.stats && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                <Icons.Cpu className="w-2.5 h-2.5" />
                CPU
              </span>
              <span className="text-[10px] font-medium">{container.stats.cpu.percentage.toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  container.stats.cpu.percentage > 80 ? 'bg-red-500' :
                  container.stats.cpu.percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(container.stats.cpu.percentage, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                <Icons.MemoryStick className="w-2.5 h-2.5" />
                RAM
              </span>
              <span className="text-[10px] font-medium">{(container.stats.memory.usage / (1024 * 1024 * 1024)).toFixed(1)}G</span>
            </div>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  container.stats.memory.percentage > 80 ? 'bg-red-500' :
                  container.stats.memory.percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(container.stats.memory.percentage, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                <Icons.HardDrive className="w-2.5 h-2.5" />
                Disk
              </span>
              <span className="text-[10px] font-medium">
                {(() => {
                  if (container.stats?.disk?.used) {
                    const gb = container.stats.disk.used / (1024 * 1024 * 1024)
                    return gb >= 1 ? `${gb.toFixed(1)}G` : `${(container.stats.disk.used / (1024 * 1024)).toFixed(0)}M`
                  }
                  const mb = (container.stats.blockIO.read + container.stats.blockIO.write) / (1024 * 1024)
                  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}G` : `${mb.toFixed(0)}M`
                })()}
              </span>
            </div>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  container.stats?.disk?.percentage 
                    ? container.stats.disk.percentage > 80 ? 'bg-red-500' :
                      container.stats.disk.percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ 
                  width: container.stats?.disk?.percentage 
                    ? `${Math.min(container.stats.disk.percentage, 100)}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {serviceUrl ? (
            <a
              href={serviceUrl}
              target="_blank"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Icons.Globe className="w-3 h-3" />
              :{primaryPort?.public}
              <Icons.ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <Icons.Lock className="w-3 h-3" />
              Internal
            </span>
          )}
          {container.ports && container.ports.length > 1 && (
            <span className="text-xs text-zinc-500">
              +{container.ports.length - 1}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {container.state === 'running' ? (
            <>
              <button
                onClick={() => onAction('restart', container.id)}
                className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all group"
                title="Restart"
              >
                <Icons.RotateCw className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
              </button>
              <button
                onClick={() => onAction('stop', container.id)}
                className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                title="Stop"
              >
                <Icons.Square className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAction('start', container.id)}
              className="p-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              title="Start"
            >
              <Icons.Play className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </button>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
          <div>
            <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Environment</h4>
            <div className="space-y-1">
              {container.details?.env?.slice(0, 3).map((env, i) => {
                const [key, value] = env.split('=')
                return (
                  <div key={i} className="text-xs font-mono">
                    <span className="text-zinc-600 dark:text-zinc-400">{key}=</span>
                    <span className="text-zinc-800 dark:text-zinc-200">{value?.substring(0, 30)}{value?.length > 30 ? '...' : ''}</span>
                  </div>
                )
              })}
              {container.details?.env && container.details.env.length > 3 && (
                <div className="text-xs text-zinc-500">+{container.details.env.length - 3} more</div>
              )}
            </div>
          </div>
          
          {container.details?.mounts && container.details.mounts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Volumes</h4>
              <div className="space-y-1">
                {container.details.mounts.slice(0, 2).map((mount: any, i: number) => (
                  <div key={i} className="text-xs text-zinc-600 dark:text-zinc-400">
                    {mount.Source?.split('/').pop() || mount.Name} → {mount.Destination}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}