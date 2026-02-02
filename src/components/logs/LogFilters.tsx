'use client'

import { Button } from '@/components/Button'
import { Search, X } from 'lucide-react'

export interface LogFilters {
  searchText: string
  level: 'all' | 'info' | 'warn' | 'error' | 'debug'
  timeRange: '5m' | '1h' | '24h' | 'custom'
  regexEnabled: boolean
  customStartTime?: Date
  customEndTime?: Date
}

interface LogFiltersProps {
  filters: LogFilters
  onChange: (filters: LogFilters) => void
  totalCount: number
  filteredCount: number
}

export function LogFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: LogFiltersProps) {
  const updateFilter = <K extends keyof LogFilters>(
    key: K,
    value: LogFilters[K],
  ) => {
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.searchText !== '' ||
    filters.level !== 'all' ||
    filters.timeRange !== '5m'

  const clearFilters = () => {
    onChange({
      searchText: '',
      level: 'all',
      timeRange: '5m',
      regexEnabled: false,
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          {filters.searchText && (
            <button
              onClick={() => updateFilter('searchText', '')}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Regex Toggle */}
        <Button
          onClick={() => updateFilter('regexEnabled', !filters.regexEnabled)}
          variant={filters.regexEnabled ? 'primary' : 'outline'}
          className="h-auto px-3 py-2 text-xs whitespace-nowrap"
        >
          .*
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Level Filter */}
        <select
          value={filters.level}
          onChange={(e) =>
            updateFilter('level', e.target.value as LogFilters['level'])
          }
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="debug">Debug</option>
        </select>

        {/* Time Range Filter */}
        <select
          value={filters.timeRange}
          onChange={(e) =>
            updateFilter('timeRange', e.target.value as LogFilters['timeRange'])
          }
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="5m">Last 5 minutes</option>
          <option value="1h">Last 1 hour</option>
          <option value="24h">Last 24 hours</option>
          <option value="custom">Custom Range</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="text"
            className="h-auto px-3 py-2 text-xs"
          >
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {/* Count Display */}
        <div className="ml-auto text-sm text-zinc-500">
          {filteredCount !== totalCount ? (
            <span>
              Showing <strong>{filteredCount}</strong> of{' '}
              <strong>{totalCount}</strong> logs
            </span>
          ) : (
            <span>
              <strong>{totalCount}</strong> logs
            </span>
          )}
        </div>
      </div>

      {/* Custom Time Range */}
      {filters.timeRange === 'custom' && (
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={
                filters.customStartTime
                  ? filters.customStartTime.toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                updateFilter('customStartTime', new Date(e.target.value))
              }
              className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">
              End Time
            </label>
            <input
              type="datetime-local"
              value={
                filters.customEndTime
                  ? filters.customEndTime.toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                updateFilter('customEndTime', new Date(e.target.value))
              }
              className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>
      )}
    </div>
  )
}
