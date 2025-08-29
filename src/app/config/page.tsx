'use client'

import { useState, useEffect } from 'react'
import { PageShell, DataSection, CardSkeleton } from '@/components/PageShell'
import { useAsyncData } from '@/hooks/useAsyncData'
import { Button } from '@/components/Button'
import * as Icons from '@/lib/icons'

interface EnvVariable {
  key: string
  value: string
  defaultValue?: string
  isSecret?: boolean
  source?: 'env' | 'default' | 'override'
  category?: string
  hasChanges?: boolean
}

export default function ConfigPage() {
  const [saving, setSaving] = useState(false)
  const [environment, setEnvironment] = useState('local')
  const [variables, setVariables] = useState<EnvVariable[]>([])
  const [showSecrets, setShowSecrets] = useState(false)
  const [showDefaults, setShowDefaults] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // Use async data hook for non-blocking fetch
  const { data, loading, error, refetch } = useAsyncData<EnvVariable[]>(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      try {
        const res = await fetch(`/api/config/env?env=${environment}&defaults=${showDefaults}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const data = await res.json()
        if (data.success) {
          return data.data.variables
        } else {
          throw new Error(data.error || 'Failed to fetch variables')
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.')
        }
        throw error
      }
    },
    {
      fetchOnMount: true,
      dependencies: [environment, showDefaults]
    }
  )

  // Update local variables when data changes
  useEffect(() => {
    if (data) {
      setVariables(data)
    }
  }, [data])

  const saveEnvironmentVariables = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/config/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          environment,
          variables
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setHasChanges(false)
        // Refetch to get latest state
        refetch()
      }
    } catch (error) {
    } finally {
      setSaving(false)
    }
  }

  const updateVariable = (key: string, value: string) => {
    setVariables(vars => vars.map(v => 
      v.key === key 
        ? { ...v, value, hasChanges: true, source: 'env' as const }
        : v
    ))
    setHasChanges(true)
  }

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section)
    } else {
      newCollapsed.add(section)
    }
    setCollapsedSections(newCollapsed)
  }

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  const exportEnvironment = () => {
    const envContent = variables
      .filter(v => v.value)
      .map(v => `${v.key}=${v.value}`)
      .join('\n')
    
    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `.env.${environment}`
    a.click()
  }

  // Filter variables
  const filteredVariables = variables.filter(v => {
    if (!searchTerm) return true
    return v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
           v.value?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Group variables by category
  const groupedVariables = filteredVariables.reduce((acc, v) => {
    const cat = v.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(v)
    return acc
  }, {} as Record<string, EnvVariable[]>)

  // Compact variable row component
  function VariableRow({ variable }: { variable: EnvVariable }) {
    const isEditing = editingKey === variable.key
    const displayValue = variable.value || variable.defaultValue || ''
    const hasValue = !!variable.value
    const isUsingDefault = !hasValue && !!variable.defaultValue
    
    if (isEditing) {
      return (
        <tr className="bg-blue-50 dark:bg-blue-950/20">
          <td className="py-1 px-3 font-mono text-xs">
            {variable.key}
            {variable.isSecret && <Icons.Lock className="inline ml-1 h-3 w-3 text-zinc-400" />}
          </td>
          <td className="py-1 px-3" colSpan={2}>
            <div className="flex items-center gap-1">
              <input
                type={variable.isSecret && !showSecrets ? 'password' : 'text'}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 px-2 py-0.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateVariable(variable.key, tempValue)
                    setEditingKey(null)
                  } else if (e.key === 'Escape') {
                    setEditingKey(null)
                  }
                }}
              />
              <button
                onClick={() => {
                  updateVariable(variable.key, tempValue)
                  setEditingKey(null)
                }}
                className="p-1 rounded bg-green-500 hover:bg-green-600 text-white"
              >
                <Icons.Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => setEditingKey(null)}
                className="p-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
              >
                <Icons.X className="h-3 w-3" />
              </button>
            </div>
          </td>
        </tr>
      )
    }
    
    return (
      <tr className={`group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 ${
        variable.hasChanges ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
      }`}>
        <td className="py-1 px-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
          {variable.key}
          {variable.isSecret && <Icons.Lock className="inline ml-1 h-3 w-3 text-zinc-400" />}
        </td>
        <td className="py-1 px-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className={`${!hasValue ? 'text-zinc-400 italic' : 'text-zinc-600 dark:text-zinc-400'}`}>
              {variable.isSecret && !showSecrets 
                ? (hasValue ? '••••••••' : 'not set')
                : (displayValue || 'not set')}
            </span>
            {isUsingDefault && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                default
              </span>
            )}
            {hasValue && !variable.hasChanges && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                set
              </span>
            )}
            {variable.hasChanges && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                modified
              </span>
            )}
          </div>
        </td>
        <td className="py-1 px-3 text-right">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
            <button
              onClick={() => copyToClipboard(displayValue)}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
             
            >
              <Icons.Copy className="h-3 w-3 text-zinc-500" />
            </button>
            <button
              onClick={() => {
                setEditingKey(variable.key)
                setTempValue(variable.value || variable.defaultValue || '')
              }}
              className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
             
            >
              <Icons.Edit className="h-3 w-3 text-zinc-500" />
            </button>
            {variable.value && (
              <button
                onClick={() => updateVariable(variable.key, '')}
                className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
               
              >
                <Icons.Trash2 className="h-3 w-3 text-red-500" />
              </button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  // Actions for the page header
  const actions = (
    <>
      {hasChanges && (
        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Icons.AlertCircle className="h-3 w-3" />
          Unsaved
        </span>
      )}
      
      <Button variant="outline" onClick={exportEnvironment}>
        <Icons.Download className="h-3 w-3" />
      </Button>
      
      <Button variant="outline" onClick={refetch}>
        <Icons.RefreshCw className="h-3 w-3" />
      </Button>
      
      <Button 
        onClick={saveEnvironmentVariables}
        disabled={!hasChanges || saving}
      >
        <Icons.Save className="h-3 w-3 mr-1" />
        Save
      </Button>
    </>
  )

  return (
    <PageShell
     
      description="Manage environment variables across all environments"
      loading={loading}
      error={error}
      actions={actions}
    >
      {/* Controls Bar */}
      <div className="mb-6 p-3 rounded-xl bg-white dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-700">
        <div className="flex flex-wrap items-center gap-3">
          {/* Environment Selector */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {['local', 'dev', 'stage', 'prod', 'secrets'].map(env => (
              <button
                key={env}
                onClick={() => setEnvironment(env)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  environment === env
                    ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
          />
          
          {/* Toggles */}
          <button
            onClick={() => setShowDefaults(!showDefaults)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              showDefaults
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {showDefaults ? '✓' : ''} Defaults
          </button>
          
          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {showSecrets ? <Icons.EyeOff className="h-3 w-3" /> : <Icons.Eye className="h-3 w-3" />}
            Secrets
          </button>
        </div>
      </div>

      {/* Variables Table */}
      <div className="space-y-4">
        {variables.length === 0 && !loading ? (
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 p-12 text-center">
            <Icons.Settings className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">No environment variables found</p>
          </div>
        ) : (
          Object.entries(groupedVariables).map(([category, vars]) => {
            const isCollapsed = collapsedSections.has(category)
            const cleanCategory = category.replace(/^\d+\.\s*/, '')
            
            return (
              <div key={category} className="rounded-xl bg-white dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full px-4 py-2 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? <Icons.ChevronRight className="h-4 w-4" /> : <Icons.ChevronDown className="h-4 w-4" />}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {cleanCategory}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
                      {vars.length}
                    </span>
                  </div>
                </button>
                
                {!isCollapsed && (
                  <table className="w-full">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {vars.map(variable => (
                        <VariableRow key={variable.key} variable={variable} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })
        )}
      </div>
    </PageShell>
  )
}