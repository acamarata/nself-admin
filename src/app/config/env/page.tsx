'use client'

import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { useAsyncData } from '@/hooks/useAsyncData'
import * as Icons from '@/lib/icons'
import { useCallback, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnvVariable {
  key: string
  value: string
  defaultValue?: string
  isSecret?: boolean
  source?: 'env' | 'default' | 'override'
  category?: string
  hasChanges?: boolean
}

type AccessRole = 'dev' | 'sr_dev' | 'lead_dev'

interface EnvironmentTab {
  id: string
  label: string
  file: string
  description: string
  minRole: AccessRole
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENVIRONMENT_TABS: EnvironmentTab[] = [
  {
    id: 'local',
    label: 'Local',
    file: '.env.local',
    description: 'Personal development settings (gitignored)',
    minRole: 'dev',
  },
  {
    id: 'dev',
    label: 'Dev',
    file: '.env.dev',
    description: 'Shared development settings (committed)',
    minRole: 'dev',
  },
  {
    id: 'stage',
    label: 'Stage',
    file: '.env.stage',
    description: 'Staging server configuration (gitignored)',
    minRole: 'sr_dev',
  },
  {
    id: 'prod',
    label: 'Prod',
    file: '.env.prod',
    description: 'Production server configuration (gitignored)',
    minRole: 'lead_dev',
  },
  {
    id: 'secrets',
    label: 'Secrets',
    file: '.env.secrets',
    description: 'Server-generated secrets (gitignored, never leaves server)',
    minRole: 'lead_dev',
  },
]

const ROLE_HIERARCHY: Record<AccessRole, number> = {
  dev: 0,
  sr_dev: 1,
  lead_dev: 2,
}

function canAccessTab(userRole: AccessRole, tabMinRole: AccessRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[tabMinRole]
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function EnvEditorPage() {
  // State
  const [environment, setEnvironment] = useState('local')
  const [variables, setVariables] = useState<EnvVariable[]>([])
  const [originalVariables, setOriginalVariables] = useState<EnvVariable[]>([])
  const [showSecrets, setShowSecrets] = useState(false)
  const [showDefaults, setShowDefaults] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Role-based access (in a real app this would come from auth context)
  // Default to lead_dev in development for full access
  const [accessRole] = useState<AccessRole>('lead_dev')

  // Visible tabs based on access role
  const visibleTabs = ENVIRONMENT_TABS.filter((tab) =>
    canAccessTab(accessRole, tab.minRole),
  )

  // Data fetching
  const { data, loading, error, refetch } = useAsyncData<EnvVariable[]>(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const res = await fetch(
          `/api/config/env?env=${environment}&defaults=${showDefaults}`,
          { signal: controller.signal },
        )
        clearTimeout(timeoutId)

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const json = await res.json()
        if (json.success) {
          return json.data.variables
        } else {
          throw new Error(json.error || 'Failed to fetch variables')
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.')
        }
        throw err
      }
    },
    {
      fetchOnMount: true,
      dependencies: [environment, showDefaults],
    },
  )

  // Sync fetched data to local state
  useEffect(() => {
    if (data) {
      setVariables(data)
      setOriginalVariables(data)
      setHasChanges(false)
      setEditingKey(null)
      setDeleteConfirm(null)
    }
  }, [data])

  // Clear save message after 4 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [saveMessage])

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const updateVariable = useCallback((key: string, value: string) => {
    setVariables((vars) =>
      vars.map((v) =>
        v.key === key
          ? { ...v, value, hasChanges: true, source: 'env' as const }
          : v,
      ),
    )
    setHasChanges(true)
  }, [])

  const addVariable = useCallback(() => {
    if (!newKey.trim()) return

    // Check for duplicate keys
    if (variables.some((v) => v.key === newKey.trim().toUpperCase())) {
      setSaveMessage({
        type: 'error',
        text: `Variable ${newKey.trim().toUpperCase()} already exists`,
      })
      return
    }

    const normalizedKey = newKey.trim().toUpperCase()

    // Validate key format
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(normalizedKey)) {
      setSaveMessage({
        type: 'error',
        text: 'Invalid variable name. Use only letters, numbers, and underscores.',
      })
      return
    }

    // Add to local state immediately
    const newVar: EnvVariable = {
      key: normalizedKey,
      value: newValue,
      source: 'env',
      hasChanges: true,
    }
    setVariables((vars) => [...vars, newVar])
    setHasChanges(true)
    setNewKey('')
    setNewValue('')
    setShowAddForm(false)
  }, [newKey, newValue, variables])

  const deleteVariable = useCallback(
    (key: string) => {
      if (deleteConfirm !== key) {
        setDeleteConfirm(key)
        return
      }

      setVariables((vars) => vars.filter((v) => v.key !== key))
      setHasChanges(true)
      setDeleteConfirm(null)
    },
    [deleteConfirm],
  )

  const saveEnvironmentVariables = useCallback(async () => {
    try {
      setSaving(true)
      setSaveMessage(null)

      const res = await fetch('/api/config/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          environment,
          variables,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setHasChanges(false)
        setOriginalVariables([...variables])

        const buildNote = json.buildSuccess
          ? ' Build completed successfully.'
          : json.buildTriggered
            ? ' Build was triggered but may need attention.'
            : ''
        setSaveMessage({
          type: 'success',
          text: `Environment saved to .env.${environment}.${buildNote}`,
        })
      } else {
        setSaveMessage({
          type: 'error',
          text: json.error || 'Failed to save',
        })
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save',
      })
    } finally {
      setSaving(false)
    }
  }, [environment, variables])

  const syncFromCLI = useCallback(async () => {
    setSaveMessage(null)
    await refetch()
    setSaveMessage({ type: 'success', text: 'Synced from file system.' })
  }, [refetch])

  const discardChanges = useCallback(() => {
    setVariables([...originalVariables])
    setHasChanges(false)
    setEditingKey(null)
  }, [originalVariables])

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  const copyToClipboard = useCallback((value: string) => {
    navigator.clipboard.writeText(value).catch(() => {
      // Clipboard API may fail if page is not focused
    })
  }, [])

  const exportEnvironment = useCallback(() => {
    const envContent = variables
      .filter((v) => v.value)
      .map((v) => `${v.key}=${v.value}`)
      .join('\n')

    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `.env.${environment}`
    a.click()
    URL.revokeObjectURL(url)
  }, [variables, environment])

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filteredVariables = variables.filter((v) => {
    if (!searchTerm) return true
    return (
      v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.value?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const groupedVariables = filteredVariables.reduce(
    (acc, v) => {
      const cat = v.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(v)
      return acc
    },
    {} as Record<string, EnvVariable[]>,
  )

  const envVarCount = variables.filter(
    (v) => v.source === 'env' && v.value,
  ).length
  const modifiedCount = variables.filter((v) => v.hasChanges).length

  const currentTab = ENVIRONMENT_TABS.find((t) => t.id === environment)

  // ---------------------------------------------------------------------------
  // Sub-components
  // ---------------------------------------------------------------------------

  function VariableRow({ variable }: { variable: EnvVariable }) {
    const isEditing = editingKey === variable.key
    const displayValue = variable.value || variable.defaultValue || ''
    const hasValue = !!variable.value
    const isUsingDefault = !hasValue && !!variable.defaultValue
    const isConfirmingDelete = deleteConfirm === variable.key

    if (isEditing) {
      return (
        <tr className="bg-blue-50 dark:bg-blue-950/20">
          <td className="px-3 py-1.5 font-mono text-xs">
            {variable.key}
            {variable.isSecret && (
              <Icons.Lock className="ml-1 inline h-3 w-3 text-zinc-400" />
            )}
          </td>
          <td className="px-3 py-1.5" colSpan={2}>
            <div className="flex items-center gap-1">
              <input
                type={variable.isSecret && !showSecrets ? 'password' : 'text'}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 rounded border border-zinc-300 bg-white px-2 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-900"
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
                className="rounded bg-green-500 p-1 text-white hover:bg-green-600"
                title="Save"
              >
                <Icons.Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => setEditingKey(null)}
                className="rounded bg-zinc-200 p-1 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                title="Cancel"
              >
                <Icons.X className="h-3 w-3" />
              </button>
            </div>
          </td>
        </tr>
      )
    }

    return (
      <tr
        className={`group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 ${
          variable.hasChanges ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
        }`}
      >
        <td className="px-3 py-1.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
          {variable.key}
          {variable.isSecret && (
            <Icons.Lock className="ml-1 inline h-3 w-3 text-zinc-400" />
          )}
        </td>
        <td className="px-3 py-1.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`truncate ${!hasValue ? 'text-zinc-400 italic' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              {variable.isSecret && !showSecrets
                ? hasValue
                  ? '••••••••'
                  : 'not set'
                : displayValue || 'not set'}
            </span>
            {isUsingDefault && (
              <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                default
              </span>
            )}
            {hasValue && !variable.hasChanges && (
              <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700 dark:bg-green-900/30 dark:text-green-400">
                set
              </span>
            )}
            {variable.hasChanges && (
              <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                modified
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-1.5 text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => copyToClipboard(displayValue)}
              className="rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              title="Copy value"
            >
              <Icons.Copy className="h-3 w-3 text-zinc-500" />
            </button>
            <button
              onClick={() => {
                setEditingKey(variable.key)
                setTempValue(variable.value || variable.defaultValue || '')
              }}
              className="rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              title="Edit value"
            >
              <Icons.Edit className="h-3 w-3 text-zinc-500" />
            </button>
            {variable.source === 'env' && (
              <button
                onClick={() => deleteVariable(variable.key)}
                className={`rounded p-0.5 ${
                  isConfirmingDelete
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                title={
                  isConfirmingDelete
                    ? 'Click again to confirm delete'
                    : 'Delete'
                }
              >
                <Icons.Trash2
                  className={`h-3 w-3 ${isConfirmingDelete ? 'text-red-600' : 'text-red-500'}`}
                />
              </button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  // ---------------------------------------------------------------------------
  // Header actions
  // ---------------------------------------------------------------------------

  const actions = (
    <>
      {saveMessage && (
        <span
          className={`flex items-center gap-1 text-xs ${
            saveMessage.type === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <Icons.CheckCircle className="h-3 w-3" />
          ) : (
            <Icons.AlertCircle className="h-3 w-3" />
          )}
          {saveMessage.text}
        </span>
      )}

      {hasChanges && (
        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <Icons.AlertCircle className="h-3 w-3" />
          {modifiedCount} unsaved
        </span>
      )}

      <Button variant="outline" onClick={exportEnvironment} title="Export">
        <Icons.Download className="h-3 w-3" />
      </Button>

      <Button variant="outline" onClick={syncFromCLI} title="Sync from file">
        <Icons.RefreshCw className="h-3 w-3" />
      </Button>

      {hasChanges && (
        <Button variant="outline" onClick={discardChanges} title="Discard">
          <Icons.X className="mr-1 h-3 w-3" />
          Discard
        </Button>
      )}

      <Button
        onClick={saveEnvironmentVariables}
        disabled={!hasChanges || saving}
      >
        <Icons.Save className="mr-1 h-3 w-3" />
        {saving ? 'Saving...' : 'Save & Build'}
      </Button>
    </>
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <PageShell
      title="Environment Editor"
      description="Manage environment variables across all environments"
      loading={loading}
      error={error}
      actions={actions}
    >
      {/* Controls Bar */}
      <div className="mb-6 rounded-xl bg-white p-3 ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-700">
        <div className="flex flex-wrap items-center gap-3">
          {/* Environment Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (hasChanges) {
                    const confirmed = window.confirm(
                      'You have unsaved changes. Switch environments?',
                    )
                    if (!confirmed) return
                  }
                  setEnvironment(tab.id)
                  setSearchTerm('')
                  setEditingKey(null)
                  setDeleteConfirm(null)
                  setShowAddForm(false)
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  environment === tab.id
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Icons.Search className="absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-44 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pr-3 pl-7 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute top-1/2 right-2 -translate-y-1/2"
              >
                <Icons.X className="h-3 w-3 text-zinc-400 hover:text-zinc-600" />
              </button>
            )}
          </div>

          {/* Toggles */}
          <button
            onClick={() => setShowDefaults(!showDefaults)}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              showDefaults
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {showDefaults ? (
              <Icons.Check className="mr-1 inline h-3 w-3" />
            ) : null}
            Defaults
          </button>

          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {showSecrets ? (
              <Icons.EyeOff className="h-3 w-3" />
            ) : (
              <Icons.Eye className="h-3 w-3" />
            )}
            Secrets
          </button>

          {/* Add Variable button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              showAddForm
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            <Icons.Plus className="h-3 w-3" />
            Add
          </button>

          {/* Variable count */}
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-500">
            {envVarCount} variable{envVarCount !== 1 ? 's' : ''} set
          </span>
        </div>

        {/* Environment description */}
        {currentTab && (
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <Icons.FileText className="h-3 w-3" />
            <span className="font-mono">{currentTab.file}</span>
            <span className="text-zinc-400">—</span>
            <span>{currentTab.description}</span>
          </div>
        )}
      </div>

      {/* Add Variable Form */}
      {showAddForm && (
        <div className="mb-4 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200 dark:bg-blue-950/20 dark:ring-blue-800">
          <div className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-300">
            Add New Variable
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="VARIABLE_NAME"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value.toUpperCase())}
              className="w-48 rounded border border-blue-300 bg-white px-3 py-1.5 font-mono text-xs uppercase focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-blue-700 dark:bg-zinc-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addVariable()
                if (e.key === 'Escape') {
                  setShowAddForm(false)
                  setNewKey('')
                  setNewValue('')
                }
              }}
              autoFocus
            />
            <span className="text-zinc-400">=</span>
            <input
              type="text"
              placeholder="value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 rounded border border-blue-300 bg-white px-3 py-1.5 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-blue-700 dark:bg-zinc-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addVariable()
                if (e.key === 'Escape') {
                  setShowAddForm(false)
                  setNewKey('')
                  setNewValue('')
                }
              }}
            />
            <Button onClick={addVariable} disabled={!newKey.trim()}>
              <Icons.Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false)
                setNewKey('')
                setNewValue('')
              }}
            >
              Cancel
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-blue-700/70 dark:text-blue-400/50">
            Variable names can contain letters, numbers, and underscores. Press
            Enter to add, Escape to cancel.
          </p>
        </div>
      )}

      {/* Variables Table */}
      <div className="space-y-4">
        {filteredVariables.length === 0 && !loading ? (
          <div className="rounded-xl bg-zinc-50 p-12 text-center dark:bg-zinc-900/50">
            <Icons.Settings className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
            <p className="text-zinc-600 dark:text-zinc-400">
              {searchTerm
                ? `No variables matching "${searchTerm}"`
                : 'No environment variables found'}
            </p>
            {!searchTerm && (
              <p className="mt-2 text-sm text-zinc-500">
                Click &quot;Add&quot; to create a new variable, or enable
                &quot;Defaults&quot; to see available settings.
              </p>
            )}
          </div>
        ) : (
          Object.entries(groupedVariables)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, vars]) => {
              const isCollapsed = collapsedSections.has(category)
              const cleanCategory = category.replace(/^\d+\.\s*/, '')
              const categoryModified = vars.filter((v) => v.hasChanges).length

              return (
                <div
                  key={category}
                  className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900/50 dark:ring-zinc-700"
                >
                  <button
                    onClick={() => toggleSection(category)}
                    className="flex w-full items-center justify-between bg-zinc-50 px-4 py-2 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <Icons.ChevronRight className="h-4 w-4" />
                      ) : (
                        <Icons.ChevronDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {cleanCategory}
                      </span>
                      <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                        {vars.length}
                      </span>
                      {categoryModified > 0 && (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {categoryModified} modified
                        </span>
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    <table className="w-full">
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {vars.map((variable) => (
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

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="fixed right-6 bottom-6 left-auto z-50 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 shadow-lg ring-1 ring-amber-200 dark:bg-amber-950/80 dark:ring-amber-800">
          <Icons.AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            {modifiedCount} unsaved change{modifiedCount !== 1 ? 's' : ''}
          </span>
          <Button variant="outline" onClick={discardChanges}>
            Discard
          </Button>
          <Button onClick={saveEnvironmentVariables} disabled={saving}>
            <Icons.Save className="mr-1 h-3 w-3" />
            {saving ? 'Saving...' : 'Save & Build'}
          </Button>
        </div>
      )}
    </PageShell>
  )
}
