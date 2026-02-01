'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Widget } from '@/types/dashboard'
import { ArrowUpDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface TableWidgetProps {
  widget: Widget
  className?: string
}

interface TableData {
  columns: Array<{
    key: string
    label: string
    type?: 'text' | 'number' | 'badge' | 'date'
    sortable?: boolean
  }>
  rows: Array<Record<string, unknown>>
}

// Mock data fetcher
async function fetchTableData(_widget: Widget): Promise<TableData> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    columns: [
      { key: 'name', label: 'Name', type: 'text', sortable: true },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'value', label: 'Value', type: 'number', sortable: true },
      { key: 'updated', label: 'Updated', type: 'date', sortable: true },
    ],
    rows: [
      {
        id: 1,
        name: 'Service A',
        status: 'active',
        value: 1234,
        updated: '2024-01-15',
      },
      {
        id: 2,
        name: 'Service B',
        status: 'warning',
        value: 856,
        updated: '2024-01-14',
      },
      {
        id: 3,
        name: 'Service C',
        status: 'active',
        value: 2341,
        updated: '2024-01-15',
      },
      {
        id: 4,
        name: 'Service D',
        status: 'error',
        value: 123,
        updated: '2024-01-13',
      },
      {
        id: 5,
        name: 'Service E',
        status: 'active',
        value: 4521,
        updated: '2024-01-15',
      },
      {
        id: 6,
        name: 'Service F',
        status: 'inactive',
        value: 0,
        updated: '2024-01-10',
      },
    ],
  }
}

// Badge variant mapping for status values
const statusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  warning: 'secondary',
  error: 'destructive',
  inactive: 'outline',
}

export function TableWidget({ widget, className }: TableWidgetProps) {
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchTableData(widget)
        if (mounted) {
          setTableData(result)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    // Set up auto-refresh if configured
    const refreshInterval = widget.config.dataSource?.refreshInterval
    let intervalId: NodeJS.Timeout | undefined

    if (refreshInterval && refreshInterval > 0) {
      intervalId = setInterval(loadData, refreshInterval * 1000)
    }

    return () => {
      mounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [widget])

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!tableData?.rows || !sortColumn) return tableData?.rows || []

    return [...tableData.rows].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      // Handle different types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal || '')
      const bStr = String(bVal || '')
      const comparison = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [tableData?.rows, sortColumn, sortDirection])

  // Handle column header click for sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Format cell value based on column type
  const formatCellValue = (
    value: unknown,
    type: string | undefined,
  ): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-zinc-400">-</span>
    }

    switch (type) {
      case 'badge': {
        const strValue = String(value)
        return (
          <Badge variant={statusVariants[strValue] || 'secondary'}>
            {strValue}
          </Badge>
        )
      }
      case 'number':
        return typeof value === 'number'
          ? value.toLocaleString()
          : String(value)
      case 'date':
        try {
          return new Date(String(value)).toLocaleDateString()
        } catch {
          return String(value)
        }
      default:
        return String(value)
    }
  }

  if (loading) {
    return (
      <div className={cn('h-full overflow-auto p-4', className)}>
        <div className="space-y-3">
          <div className="h-8 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded bg-zinc-50 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn('flex h-full items-center justify-center p-4', className)}
      >
        <div className="text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!tableData || tableData.rows.length === 0) {
    return (
      <div
        className={cn('flex h-full items-center justify-center p-4', className)}
      >
        <div className="text-center">
          <p className="text-sm text-zinc-500">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('h-full overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {tableData.columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.sortable &&
                    'cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-900',
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && (
                    <ArrowUpDown
                      className={cn(
                        'h-3.5 w-3.5',
                        sortColumn === column.key
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-400',
                      )}
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, rowIndex) => (
            <TableRow key={row.id ? String(row.id) : rowIndex}>
              {tableData.columns.map((column) => (
                <TableCell key={column.key}>
                  {formatCellValue(row[column.key], column.type)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
