'use client'

import { useState, useMemo } from 'react'
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
}

type SortColumn = 'name' | 'status' | 'cpu' | 'memory' | 'disk' | 'uptime' | 'port'

export function ServiceListView({ 
  containers, 
  onAction, 
  getHealthColor, 
  getHealthText,
  getServiceCategory 
}: { 
  containers: Container[]
  onAction: (action: string, containerId: string) => void
  getHealthColor: (health: string) => string
  getHealthText: (health: string) => string
  getServiceCategory: (name: string) => 'required' | 'optional' | 'user'
}) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }
  
  const getUptime = (created: number) => {
    const now = Date.now() / 1000
    const diff = now - created
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
  
  const sortedContainers = useMemo(() => {
    return [...containers].sort((a, b) => {
      let comparison = 0
      
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = (a.health || 'stopped').localeCompare(b.health || 'stopped')
          break
        case 'cpu':
          comparison = (a.stats?.cpu.percentage || 0) - (b.stats?.cpu.percentage || 0)
          break
        case 'memory':
          comparison = (a.stats?.memory.usage || 0) - (b.stats?.memory.usage || 0)
          break
        case 'disk':
          comparison = (a.stats?.disk?.used || a.stats?.blockIO?.read || 0) - 
                       (b.stats?.disk?.used || b.stats?.blockIO?.read || 0)
          break
        case 'uptime':
          comparison = a.created - b.created
          break
        case 'port':
          const aPort = a.ports?.find(p => p.public)?.public || 99999
          const bPort = b.ports?.find(p => p.public)?.public || 99999
          comparison = aPort - bPort
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [containers, sortColumn, sortDirection])
  
  const SortIcon = ({ column }: { column: typeof sortColumn }) => {
    if (sortColumn !== column) {
      return <Icons.ArrowUp className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100" />
    }
    return sortDirection === 'asc' 
      ? <Icons.ArrowUp className="w-3 h-3 text-blue-500" />
      : <Icons.ArrowDown className="w-3 h-3 text-blue-500" />
  }
  
  const requiredContainers = sortedContainers.filter(c => getServiceCategory(c.name) === 'required')
  const optionalContainers = sortedContainers.filter(c => getServiceCategory(c.name) === 'optional')
  const userContainers = sortedContainers.filter(c => getServiceCategory(c.name) === 'user')
  
  const renderRows = (containerList: Container[], category: 'required' | 'optional' | 'user') => {
    const categoryIcons = {
      required: <Icons.Layers className="w-4 h-4 text-blue-500" />,
      optional: <Icons.Shield className="w-4 h-4 text-purple-500" />,
      user: <Icons.Box className="w-4 h-4 text-orange-500" />
    }
    
    const categoryLabels = {
      required: 'Required Services',
      optional: 'Optional Services',
      user: 'User Services'
    }
    
    if (containerList.length === 0) return null
    
    return (
      <>
        <tr>
          <td colSpan={8} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2">
              {categoryIcons[category]}
              <span className="text-sm font-medium">{categoryLabels[category]}</span>
              <span className="text-xs text-zinc-500">({containerList.length})</span>
            </div>
          </td>
        </tr>
        {containerList.map(container => {
          const primaryPort = container.ports?.find(p => p.public)
          const displayName = container.name.replace(/^nself[-_]/, '').replace(/_/g, '-')
          const healthColor = getHealthColor(container.health || 'stopped')
          const healthText = getHealthText(container.health || 'stopped')
          
          return (
            <tr key={container.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-sm">{displayName}</div>
                  <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${healthColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {healthText}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {container.stats ? (
                  <div className="text-sm">
                    <div className="text-zinc-600 dark:text-zinc-400">
                      CPU: {container.stats.cpu.percentage.toFixed(0)}%
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {container.stats ? (
                  <div className="text-sm">
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {(container.stats.memory.usage / (1024 * 1024 * 1024)).toFixed(1)}GB
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {container.stats ? (
                  <div className="text-sm">
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {(() => {
                        if (container.stats?.disk?.used) {
                          const gb = container.stats.disk.used / (1024 * 1024 * 1024)
                          return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(container.stats.disk.used / (1024 * 1024)).toFixed(0)}MB`
                        }
                        return '-'
                      })()}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {container.state === 'running' ? (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {getUptime(container.created)}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {primaryPort ? (
                  <a href={`http://localhost:${primaryPort.public}`} target="_blank" 
                     className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    :{primaryPort.public}
                    <Icons.ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-sm text-zinc-500">Internal</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-zinc-500 font-mono">{container.image}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {container.state === 'running' ? (
                    <>
                      <button
                        onClick={() => onAction('restart', container.id)}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        title="Restart"
                      >
                        <Icons.RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onAction('stop', container.id)}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        title="Stop"
                      >
                        <Icons.Square className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onAction('start', container.id)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      title="Start"
                    >
                      <Icons.Play className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onAction('logs', container.id)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    title="Logs"
                  >
                    <Icons.FileText className="w-3 h-3" />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </>
    )
  }
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
          <tr>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Service <SortIcon column="name" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
              onClick={() => handleSort('cpu')}
            >
              <div className="flex items-center gap-1">
                CPU <SortIcon column="cpu" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
              onClick={() => handleSort('memory')}
            >
              <div className="flex items-center gap-1">
                Memory <SortIcon column="memory" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
              onClick={() => handleSort('disk')}
            >
              <div className="flex items-center gap-1">
                Disk <SortIcon column="disk" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
              onClick={() => handleSort('uptime')}
            >
              <div className="flex items-center gap-1">
                Uptime <SortIcon column="uptime" />
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer group"
              onClick={() => handleSort('port')}
            >
              <div className="flex items-center gap-1">
                Port <SortIcon column="port" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {renderRows(requiredContainers, 'required')}
          {renderRows(optionalContainers, 'optional')}
          {renderRows(userContainers, 'user')}
        </tbody>
      </table>
    </div>
  )
}