'use client'

import type { Plugin, PluginSyncStatus } from '@/types/plugins'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Github,
  Plug,
  Plus,
  RefreshCw,
  Settings,
  ShoppingCart,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Plugin icon mapping
const pluginIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  stripe: CreditCard,
  shopify: ShoppingCart,
  github: Github,
  default: Plug,
}

function getPluginIcon(name: string) {
  const lowerName = name.toLowerCase()
  for (const [key, Icon] of Object.entries(pluginIcons)) {
    if (lowerName.includes(key)) return Icon
  }
  return pluginIcons.default
}

// Metric Card Component
function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="group relative rounded-2xl bg-zinc-50/90 p-6 transition-colors duration-300 hover:bg-emerald-50/80 dark:bg-white/5 dark:hover:bg-emerald-950/40"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-200 to-emerald-100 opacity-0 transition duration-300 group-hover:opacity-100 dark:from-emerald-500/40 dark:to-emerald-400/30"
        style={{
          maskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`,
        }}
      />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/10 transition-colors duration-300 ring-inset group-hover:ring-emerald-500/50 dark:ring-white/20 dark:group-hover:ring-emerald-400/60" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 transition-colors duration-300 group-hover:bg-emerald-500/40 dark:bg-emerald-400/20 dark:group-hover:bg-emerald-400/40">
            <Icon className="h-4 w-4 text-emerald-600 group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {value}
          </div>
        </div>
        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// Plugin Card Component
function PluginCard({
  plugin,
  syncStatus,
  onSync,
}: {
  plugin: Plugin
  syncStatus?: PluginSyncStatus
  onSync: (name: string) => void
}) {
  const Icon = getPluginIcon(plugin.name)
  const isActive = plugin.status === 'installed'
  const isSyncing = syncStatus?.status === 'syncing'

  const statusColors = {
    installed: 'bg-emerald-500/20 text-emerald-400',
    available: 'bg-zinc-600/20 text-zinc-400',
    update_available: 'bg-yellow-500/20 text-yellow-400',
    installing: 'bg-blue-500/20 text-blue-400',
    error: 'bg-red-500/20 text-red-400',
  }

  const statusLabels = {
    installed: 'Active',
    available: 'Available',
    update_available: 'Update Available',
    installing: 'Installing...',
    error: 'Error',
  }

  return (
    <div className="group rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5 transition-all hover:border-emerald-500/50 hover:bg-zinc-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700/50">
            <Icon className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="font-medium text-white capitalize">{plugin.name}</h3>
            <p className="text-xs text-zinc-500">v{plugin.version}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${statusColors[plugin.status]}`}
        >
          {statusLabels[plugin.status]}
        </span>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-zinc-400">
        {plugin.description}
      </p>

      {isActive && syncStatus && (
        <div className="mb-4 rounded-lg bg-zinc-900/50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Last sync</span>
            <span className="text-zinc-400">
              {syncStatus.lastSync
                ? new Date(syncStatus.lastSync).toLocaleString()
                : 'Never'}
            </span>
          </div>
          {syncStatus.recordsTotal > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Records</span>
              <span className="text-zinc-400">
                {syncStatus.recordsTotal.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <Link
              href={`/plugins/${plugin.name}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-700/50 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              <Settings className="h-4 w-4" />
              Configure
            </Link>
            <button
              onClick={() => onSync(plugin.name)}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600/20 px-3 py-2 text-sm text-emerald-400 transition-colors hover:bg-emerald-600/30 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
              />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          </>
        ) : (
          <Link
            href={`/plugins/marketplace?install=${plugin.name}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Install
          </Link>
        )}
      </div>
    </div>
  )
}

export default function PluginsPage() {
  const [_syncing, setSyncing] = useState<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR<{
    plugins: Plugin[]
    syncStatuses: PluginSyncStatus[]
  }>('/api/plugins', fetcher, {
    refreshInterval: 30000,
  })

  const handleSync = async (pluginName: string) => {
    setSyncing(pluginName)
    try {
      await fetch(`/api/plugins/${pluginName}/sync`, { method: 'POST' })
      mutate()
    } finally {
      setSyncing(null)
    }
  }

  const plugins = data?.plugins || []
  const syncStatuses = data?.syncStatuses || []

  const installedCount = plugins.filter((p) => p.status === 'installed').length
  const activeCount = plugins.filter(
    (p) =>
      p.status === 'installed' &&
      syncStatuses.find((s) => s.pluginName === p.name)?.status !== 'error',
  ).length
  const totalRecords = syncStatuses.reduce(
    (acc, s) => acc + (s.recordsTotal || 0),
    0,
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Plugins</h1>
            <p className="text-sm text-zinc-400">
              Manage third-party integrations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-zinc-800/50"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Plugins</h1>
            <p className="text-sm text-zinc-400">
              Manage third-party integrations
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">Failed to load plugins</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Plugins</h1>
          <p className="text-sm text-zinc-400">
            Manage third-party integrations
          </p>
        </div>
        <Link
          href="/plugins/marketplace"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" /> Install Plugin
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Installed Plugins"
          value={installedCount}
          description="Total plugins installed"
          icon={Plug}
        />
        <MetricCard
          title="Active Plugins"
          value={activeCount}
          description="Running without errors"
          icon={CheckCircle}
        />
        <MetricCard
          title="Total Records"
          value={totalRecords.toLocaleString()}
          description="Synced from all plugins"
          icon={Activity}
        />
        <MetricCard
          title="Last Activity"
          value={
            syncStatuses.length > 0
              ? new Date(
                  Math.max(
                    ...syncStatuses.map((s) => new Date(s.lastSync).getTime()),
                  ),
                ).toLocaleDateString()
              : 'N/A'
          }
          description="Most recent sync"
          icon={Clock}
        />
      </div>

      {/* Plugin Grid */}
      {plugins.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.name}
              plugin={plugin}
              syncStatus={syncStatuses.find(
                (s) => s.pluginName === plugin.name,
              )}
              onSync={handleSync}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/30 py-16">
          <Zap className="mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="mb-2 text-lg font-medium text-white">
            No plugins installed
          </h3>
          <p className="mb-4 text-sm text-zinc-400">
            Get started by installing plugins from the marketplace
          </p>
          <Link
            href="/plugins/marketplace"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" /> Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  )
}
