'use client'

import { PageTemplate } from '@/components/PageTemplate'
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Key,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface Secret {
  key: string
  value: string
  masked: boolean
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEnv, setSelectedEnv] = useState('')

  // Add secret form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit inline
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  // Revealed secrets
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>(
    {},
  )
  const [revealingKey, setRevealingKey] = useState<string | null>(null)

  // Delete confirmation
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Bulk operations
  const [rotatingAll, setRotatingAll] = useState(false)
  const [rotatingKey, setRotatingKey] = useState<string | null>(null)

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const fetchSecrets = useCallback(async () => {
    try {
      setLoading(true)
      clearMessages()

      const params = new URLSearchParams()
      if (selectedEnv) params.set('env', selectedEnv)

      const res = await fetch(`/api/config/secrets?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setSecrets(data.data.secrets || [])
      } else {
        setSecrets([])
      }
    } catch (_err) {
      setError('Failed to load secrets')
      setSecrets([])
    } finally {
      setLoading(false)
    }
  }, [selectedEnv])

  useEffect(() => {
    fetchSecrets()
  }, [fetchSecrets])

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey || !newValue) return

    try {
      setAdding(true)
      clearMessages()

      const res = await fetch('/api/config/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey,
          value: newValue,
          env: selectedEnv || undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMessage(`Secret '${newKey}' added successfully`)
        setNewKey('')
        setNewValue('')
        setShowAddForm(false)
        await fetchSecrets()
      } else {
        setError(data.details || data.error || 'Failed to add secret')
      }
    } catch (_err) {
      setError('Failed to add secret')
    } finally {
      setAdding(false)
    }
  }

  const handleEdit = async (key: string) => {
    if (!editValue) return

    try {
      setSaving(true)
      clearMessages()

      const res = await fetch('/api/config/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: editValue,
          env: selectedEnv || undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMessage(`Secret '${key}' updated successfully`)
        setEditingKey(null)
        setEditValue('')
        // Clear revealed value for this key
        setRevealedKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        setRevealedValues((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        await fetchSecrets()
      } else {
        setError(data.details || data.error || 'Failed to update secret')
      }
    } catch (_err) {
      setError('Failed to update secret')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (key: string) => {
    try {
      setDeletingKey(key)
      clearMessages()

      const res = await fetch(
        `/api/config/secrets/${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
        },
      )
      const data = await res.json()

      if (data.success) {
        setSuccessMessage(`Secret '${key}' deleted successfully`)
        setConfirmDelete(null)
        await fetchSecrets()
      } else {
        setError(data.details || data.error || 'Failed to delete secret')
      }
    } catch (_err) {
      setError('Failed to delete secret')
    } finally {
      setDeletingKey(null)
    }
  }

  const handleReveal = async (key: string) => {
    if (revealedKeys.has(key)) {
      setRevealedKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      return
    }

    try {
      setRevealingKey(key)

      const res = await fetch(`/api/config/secrets/${encodeURIComponent(key)}`)
      const data = await res.json()

      if (data.success) {
        setRevealedKeys((prev) => new Set(prev).add(key))
        setRevealedValues((prev) => ({ ...prev, [key]: data.data.value }))
      } else {
        setError(data.error || 'Failed to reveal secret')
      }
    } catch (_err) {
      setError('Failed to reveal secret')
    } finally {
      setRevealingKey(null)
    }
  }

  const handleRotate = async (key?: string) => {
    try {
      if (key) {
        setRotatingKey(key)
      } else {
        setRotatingAll(true)
      }
      clearMessages()

      const res = await fetch('/api/config/secrets/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: key || undefined,
          env: selectedEnv || undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMessage(
          key
            ? `Secret '${key}' rotated successfully`
            : 'All secrets rotated successfully',
        )
        // Clear all revealed values
        setRevealedKeys(new Set())
        setRevealedValues({})
        await fetchSecrets()
      } else {
        setError(data.details || data.error || 'Failed to rotate secrets')
      }
    } catch (_err) {
      setError('Failed to rotate secrets')
    } finally {
      setRotatingKey(null)
      setRotatingAll(false)
    }
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setSuccessMessage('Copied to clipboard')
    } catch (_err) {
      setError('Failed to copy to clipboard')
    }
  }

  const handleExportKeys = () => {
    const keys = secrets.map((s) => s.key).join('\n')
    const blob = new Blob([keys], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `secrets-keys${selectedEnv ? `-${selectedEnv}` : ''}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setSuccessMessage('Keys list exported')
  }

  const filteredSecrets = secrets.filter((s) =>
    s.key.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <PageTemplate
      title="Secrets Management"
      description="Manage application secrets securely"
    >
      <div className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1 text-sm whitespace-pre-wrap text-red-800 dark:text-red-200">
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div className="text-sm text-green-800 dark:text-green-200">
              {successMessage}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search secrets..."
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-3 pl-9 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
            </div>

            {/* Environment Filter */}
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            >
              <option value="">All Environments</option>
              <option value="local">Local</option>
              <option value="dev">Development</option>
              <option value="stage">Staging</option>
              <option value="prod">Production</option>
            </select>

            {/* Actions */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Secret
            </button>

            <button
              onClick={fetchSecrets}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Add Secret Form */}
        {showAddForm && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Add New Secret
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewKey('')
                  setNewValue('')
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Key
                  </label>
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) =>
                      setNewKey(
                        e.target.value.toUpperCase().replace(/\s/g, '_'),
                      )
                    }
                    placeholder="DATABASE_PASSWORD"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Letters, numbers, underscores, and hyphens only
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Value
                  </label>
                  <input
                    type="password"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Enter secret value"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={adding || !newKey || !newValue}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Secret
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewKey('')
                    setNewValue('')
                  }}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Secrets Table */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Secrets
              <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                {filteredSecrets.length}
              </span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportKeys}
                disabled={secrets.length === 0}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <Copy className="h-3 w-3" />
                Export Keys
              </button>
              <button
                onClick={() => handleRotate()}
                disabled={rotatingAll || secrets.length === 0}
                className="flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs text-orange-700 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                {rotatingAll ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3" />
                )}
                Rotate All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : filteredSecrets.length === 0 ? (
            <div className="py-12 text-center">
              <Key className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {searchQuery
                  ? 'No secrets match your search'
                  : 'No secrets found. Add one to get started.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredSecrets.map((secret) => (
                <div
                  key={secret.key}
                  className="group flex items-center gap-4 px-6 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {/* Key */}
                  <div className="min-w-[200px] flex-shrink-0">
                    <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-900 dark:bg-zinc-700 dark:text-white">
                      {secret.key}
                    </code>
                  </div>

                  {/* Value */}
                  <div className="flex-1">
                    {editingKey === secret.key ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-blue-600 dark:bg-zinc-700 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEdit(secret.key)
                            if (e.key === 'Escape') {
                              setEditingKey(null)
                              setEditValue('')
                            }
                          }}
                        />
                        <button
                          onClick={() => handleEdit(secret.key)}
                          disabled={saving || !editValue}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingKey(null)
                            setEditValue('')
                          }}
                          className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                        {revealedKeys.has(secret.key)
                          ? revealedValues[secret.key] || secret.value
                          : '••••••••••••'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {editingKey !== secret.key && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* Reveal / Hide */}
                      <button
                        onClick={() => handleReveal(secret.key)}
                        disabled={revealingKey === secret.key}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                        title={revealedKeys.has(secret.key) ? 'Hide' : 'Reveal'}
                      >
                        {revealingKey === secret.key ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : revealedKeys.has(secret.key) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                      {/* Copy (only when revealed) */}
                      {revealedKeys.has(secret.key) && (
                        <button
                          onClick={() =>
                            handleCopy(
                              revealedValues[secret.key] || secret.value,
                            )
                          }
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                          title="Copy value"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingKey(secret.key)
                          setEditValue(
                            revealedKeys.has(secret.key)
                              ? revealedValues[secret.key] || ''
                              : '',
                          )
                        }}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                        title="Edit"
                      >
                        <Key className="h-4 w-4" />
                      </button>

                      {/* Rotate */}
                      <button
                        onClick={() => handleRotate(secret.key)}
                        disabled={rotatingKey === secret.key}
                        className="rounded-lg p-1.5 text-orange-500 transition-colors hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-300"
                        title="Rotate"
                      >
                        {rotatingKey === secret.key ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </button>

                      {/* Delete */}
                      {confirmDelete === secret.key ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(secret.key)}
                            disabled={deletingKey === secret.key}
                            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingKey === secret.key ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              'Confirm'
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(secret.key)}
                          className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLI Reference */}
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            CLI Commands
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <code className="inline-block min-w-[300px] rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-700">
                nself config secrets list
              </code>
              <span className="text-zinc-600 dark:text-zinc-400">
                List all secret keys
              </span>
            </div>
            <div className="flex items-start gap-3">
              <code className="inline-block min-w-[300px] rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-700">
                nself config secrets get &lt;key&gt;
              </code>
              <span className="text-zinc-600 dark:text-zinc-400">
                Get a specific secret value
              </span>
            </div>
            <div className="flex items-start gap-3">
              <code className="inline-block min-w-[300px] rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-700">
                nself config secrets set &lt;key&gt; &lt;value&gt;
              </code>
              <span className="text-zinc-600 dark:text-zinc-400">
                Set or update a secret
              </span>
            </div>
            <div className="flex items-start gap-3">
              <code className="inline-block min-w-[300px] rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-700">
                nself config secrets delete &lt;key&gt;
              </code>
              <span className="text-zinc-600 dark:text-zinc-400">
                Remove a secret
              </span>
            </div>
            <div className="flex items-start gap-3">
              <code className="inline-block min-w-[300px] rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-700">
                nself config secrets rotate [key]
              </code>
              <span className="text-zinc-600 dark:text-zinc-400">
                Rotate one or all secrets
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}
