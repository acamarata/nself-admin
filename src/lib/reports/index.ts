/**
 * Reports library for nself-admin
 * Provides mock report templates, executions, and API functions
 */

import type {
  GenerateReportInput,
  ReportExecution,
  ReportFilter,
  ReportFormat,
  ReportSchedule,
  ReportScheduleFrequency,
  ReportSort,
  ReportStats,
  ReportStatus,
  ReportTemplate,
} from '@/types/report'
import { api } from '../api-client'

const BASE_URL = '/api/reports'

// ============================================================================
// Mock Data
// ============================================================================

/**
 * Mock report templates for common reports
 */
export const mockTemplates: ReportTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Service Health Report',
    description:
      'Overview of all service health metrics including uptime, response times, and error rates',
    category: 'infrastructure',
    dataSource: { type: 'api', endpoint: '/api/services/health' },
    columns: [
      {
        id: 'c1',
        name: 'Service',
        field: 'name',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c2',
        name: 'Status',
        field: 'status',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c3',
        name: 'Uptime',
        field: 'uptime',
        type: 'number',
        format: '0.00%',
        sortable: true,
      },
      {
        id: 'c4',
        name: 'Response Time (ms)',
        field: 'responseTime',
        type: 'number',
        format: '0',
        sortable: true,
      },
      {
        id: 'c5',
        name: 'Error Rate',
        field: 'errorRate',
        type: 'number',
        format: '0.00%',
        sortable: true,
      },
      {
        id: 'c6',
        name: 'Last Check',
        field: 'lastCheck',
        type: 'date',
        sortable: true,
      },
    ],
    defaultSort: [{ field: 'name', direction: 'asc' }],
    visualization: { type: 'table' },
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-2',
    name: 'User Activity Report',
    description:
      'Detailed analysis of user activity including logins, actions, and session data',
    category: 'security',
    dataSource: { type: 'database', query: 'SELECT * FROM audit_log' },
    columns: [
      {
        id: 'c1',
        name: 'User',
        field: 'username',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c2',
        name: 'Action',
        field: 'action',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c3',
        name: 'IP Address',
        field: 'ipAddress',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c4',
        name: 'Timestamp',
        field: 'timestamp',
        type: 'date',
        sortable: true,
      },
      {
        id: 'c5',
        name: 'Success',
        field: 'success',
        type: 'boolean',
        filterable: true,
      },
      { id: 'c6', name: 'Details', field: 'details', type: 'string' },
    ],
    defaultSort: [{ field: 'timestamp', direction: 'desc' }],
    visualization: { type: 'table' },
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-3',
    name: 'Database Performance Report',
    description:
      'Database performance metrics including query times, connection pools, and resource usage',
    category: 'database',
    dataSource: { type: 'service', endpoint: '/api/database/metrics' },
    columns: [
      {
        id: 'c1',
        name: 'Query',
        field: 'query',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c2',
        name: 'Execution Time (ms)',
        field: 'executionTime',
        type: 'number',
        format: '0.00',
        sortable: true,
      },
      {
        id: 'c3',
        name: 'Rows Affected',
        field: 'rowsAffected',
        type: 'number',
        format: '0',
        sortable: true,
      },
      {
        id: 'c4',
        name: 'Calls',
        field: 'callCount',
        type: 'number',
        format: '0',
        sortable: true,
        aggregation: 'sum',
      },
      {
        id: 'c5',
        name: 'Avg Time',
        field: 'avgTime',
        type: 'number',
        format: '0.00',
        sortable: true,
        aggregation: 'avg',
      },
      {
        id: 'c6',
        name: 'Cache Hits',
        field: 'cacheHits',
        type: 'number',
        format: '0',
        aggregation: 'sum',
      },
      {
        id: 'c7',
        name: 'Timestamp',
        field: 'timestamp',
        type: 'date',
        sortable: true,
      },
    ],
    defaultSort: [{ field: 'executionTime', direction: 'desc' }],
    visualization: { type: 'chart', chartType: 'bar' },
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-4',
    name: 'Security Audit Report',
    description:
      'Comprehensive security audit including access attempts, permission changes, and threat detection',
    category: 'security',
    dataSource: { type: 'database', query: 'SELECT * FROM security_events' },
    columns: [
      {
        id: 'c1',
        name: 'Event Type',
        field: 'eventType',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c2',
        name: 'Severity',
        field: 'severity',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c3',
        name: 'Source IP',
        field: 'sourceIp',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c4',
        name: 'User',
        field: 'user',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c5',
        name: 'Resource',
        field: 'resource',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c6',
        name: 'Action',
        field: 'action',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c7',
        name: 'Status',
        field: 'status',
        type: 'string',
        filterable: true,
      },
      {
        id: 'c8',
        name: 'Timestamp',
        field: 'timestamp',
        type: 'date',
        sortable: true,
      },
    ],
    defaultFilters: [
      { field: 'severity', operator: 'in', value: ['high', 'critical'] },
    ],
    defaultSort: [{ field: 'timestamp', direction: 'desc' }],
    visualization: { type: 'table' },
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-5',
    name: 'Resource Usage Report',
    description:
      'System resource utilization including CPU, memory, disk, and network usage over time',
    category: 'infrastructure',
    dataSource: { type: 'api', endpoint: '/api/system/resources' },
    columns: [
      {
        id: 'c1',
        name: 'Timestamp',
        field: 'timestamp',
        type: 'date',
        sortable: true,
      },
      {
        id: 'c2',
        name: 'CPU Usage',
        field: 'cpuUsage',
        type: 'number',
        format: '0.0%',
        sortable: true,
      },
      {
        id: 'c3',
        name: 'Memory Usage',
        field: 'memoryUsage',
        type: 'number',
        format: '0.0%',
        sortable: true,
      },
      {
        id: 'c4',
        name: 'Disk Usage',
        field: 'diskUsage',
        type: 'number',
        format: '0.0%',
        sortable: true,
      },
      {
        id: 'c5',
        name: 'Network In (MB)',
        field: 'networkIn',
        type: 'number',
        format: '0.00',
        sortable: true,
      },
      {
        id: 'c6',
        name: 'Network Out (MB)',
        field: 'networkOut',
        type: 'number',
        format: '0.00',
        sortable: true,
      },
      {
        id: 'c7',
        name: 'Active Connections',
        field: 'connections',
        type: 'number',
        format: '0',
        sortable: true,
      },
    ],
    defaultSort: [{ field: 'timestamp', direction: 'desc' }],
    visualization: { type: 'chart', chartType: 'line' },
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tpl-6',
    name: 'API Usage Report',
    description:
      'API endpoint usage statistics including request counts, response times, and error rates',
    category: 'analytics',
    dataSource: { type: 'api', endpoint: '/api/analytics/api-usage' },
    columns: [
      {
        id: 'c1',
        name: 'Endpoint',
        field: 'endpoint',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c2',
        name: 'Method',
        field: 'method',
        type: 'string',
        sortable: true,
        filterable: true,
      },
      {
        id: 'c3',
        name: 'Total Requests',
        field: 'totalRequests',
        type: 'number',
        format: '0',
        sortable: true,
        aggregation: 'sum',
      },
      {
        id: 'c4',
        name: 'Avg Response (ms)',
        field: 'avgResponseTime',
        type: 'number',
        format: '0.00',
        sortable: true,
        aggregation: 'avg',
      },
      {
        id: 'c5',
        name: 'Error Rate',
        field: 'errorRate',
        type: 'number',
        format: '0.00%',
        sortable: true,
      },
      {
        id: 'c6',
        name: '2xx',
        field: 'status2xx',
        type: 'number',
        format: '0',
        aggregation: 'sum',
      },
      {
        id: 'c7',
        name: '4xx',
        field: 'status4xx',
        type: 'number',
        format: '0',
        aggregation: 'sum',
      },
      {
        id: 'c8',
        name: '5xx',
        field: 'status5xx',
        type: 'number',
        format: '0',
        aggregation: 'sum',
      },
    ],
    defaultSort: [{ field: 'totalRequests', direction: 'desc' }],
    visualization: { type: 'chart', chartType: 'bar' },
    createdBy: 'system',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
]

/**
 * Mock report executions
 */
export const mockExecutions: ReportExecution[] = [
  {
    id: 'exec-1',
    reportId: 'tpl-1',
    status: 'completed',
    format: 'pdf',
    fileUrl: '/api/reports/download/exec-1',
    fileSize: 245678,
    rowCount: 12,
    startedAt: '2026-01-28T10:00:00Z',
    completedAt: '2026-01-28T10:00:15Z',
    expiresAt: '2026-02-04T10:00:15Z',
    createdBy: 'admin',
  },
  {
    id: 'exec-2',
    reportId: 'tpl-2',
    status: 'completed',
    format: 'excel',
    fileUrl: '/api/reports/download/exec-2',
    fileSize: 512000,
    rowCount: 1250,
    startedAt: '2026-01-28T09:30:00Z',
    completedAt: '2026-01-28T09:30:45Z',
    expiresAt: '2026-02-04T09:30:45Z',
    createdBy: 'admin',
  },
  {
    id: 'exec-3',
    reportId: 'tpl-3',
    scheduleId: 'sched-1',
    status: 'completed',
    format: 'csv',
    fileUrl: '/api/reports/download/exec-3',
    fileSize: 89234,
    rowCount: 500,
    startedAt: '2026-01-28T00:00:00Z',
    completedAt: '2026-01-28T00:00:30Z',
    expiresAt: '2026-02-04T00:00:30Z',
    createdBy: 'system',
  },
  {
    id: 'exec-4',
    reportId: 'tpl-4',
    status: 'failed',
    format: 'pdf',
    error: 'Database connection timeout',
    startedAt: '2026-01-27T15:00:00Z',
    createdBy: 'admin',
  },
  {
    id: 'exec-5',
    reportId: 'tpl-5',
    status: 'generating',
    format: 'json',
    startedAt: '2026-01-28T10:30:00Z',
    createdBy: 'admin',
  },
]

/**
 * Mock report schedules
 */
export const mockSchedules: ReportSchedule[] = [
  {
    id: 'sched-1',
    reportId: 'tpl-1',
    frequency: 'daily',
    time: '08:00',
    timezone: 'America/New_York',
    format: 'pdf',
    recipients: ['admin@example.com', 'ops@example.com'],
    enabled: true,
    lastRun: '2026-01-28T08:00:00Z',
    nextRun: '2026-01-29T08:00:00Z',
  },
  {
    id: 'sched-2',
    reportId: 'tpl-3',
    frequency: 'weekly',
    dayOfWeek: 1,
    time: '09:00',
    timezone: 'America/New_York',
    format: 'excel',
    recipients: ['dba@example.com'],
    enabled: true,
    lastRun: '2026-01-27T09:00:00Z',
    nextRun: '2026-02-03T09:00:00Z',
  },
  {
    id: 'sched-3',
    reportId: 'tpl-4',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '06:00',
    timezone: 'America/New_York',
    format: 'pdf',
    recipients: ['security@example.com', 'compliance@example.com'],
    enabled: true,
    lastRun: '2026-01-01T06:00:00Z',
    nextRun: '2026-02-01T06:00:00Z',
  },
  {
    id: 'sched-4',
    reportId: 'tpl-5',
    frequency: 'hourly',
    time: '00',
    timezone: 'UTC',
    format: 'json',
    recipients: ['monitoring@example.com'],
    enabled: false,
  },
]

// ============================================================================
// Input Types
// ============================================================================

export interface CreateReportTemplateInput {
  name: string
  description?: string
  category: string
  dataSource: ReportTemplate['dataSource']
  columns: ReportTemplate['columns']
  defaultFilters?: ReportFilter[]
  defaultSort?: ReportSort[]
  visualization?: ReportTemplate['visualization']
}

export interface UpdateReportTemplateInput {
  name?: string
  description?: string
  category?: string
  dataSource?: ReportTemplate['dataSource']
  columns?: ReportTemplate['columns']
  defaultFilters?: ReportFilter[]
  defaultSort?: ReportSort[]
  visualization?: ReportTemplate['visualization']
}

export interface GetReportExecutionsOptions {
  status?: ReportStatus
  format?: ReportFormat
  limit?: number
  offset?: number
}

export interface CreateScheduleInput {
  frequency: ReportScheduleFrequency
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  timezone: string
  format: ReportFormat
  recipients: string[]
  enabled?: boolean
}

export interface UpdateScheduleInput {
  frequency?: ReportScheduleFrequency
  dayOfWeek?: number
  dayOfMonth?: number
  time?: string
  timezone?: string
  format?: ReportFormat
  recipients?: string[]
  enabled?: boolean
}

// ============================================================================
// Template API Functions
// ============================================================================

/**
 * Get all report templates, optionally filtered by category
 */
export async function getReportTemplates(
  category?: string,
): Promise<ReportTemplate[]> {
  const url = category
    ? `${BASE_URL}/templates?category=${encodeURIComponent(category)}`
    : `${BASE_URL}/templates`
  const response = await api.get(url)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to get report templates')
  return data.data
}

/**
 * Get a report template by ID
 */
export async function getReportTemplateById(
  id: string,
): Promise<ReportTemplate> {
  const response = await api.get(`${BASE_URL}/templates/${id}`)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to get report template')
  return data.data
}

/**
 * Create a new report template
 */
export async function createReportTemplate(
  input: CreateReportTemplateInput,
): Promise<ReportTemplate> {
  const response = await api.post(`${BASE_URL}/templates`, input)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to create report template')
  return data.data
}

/**
 * Update an existing report template
 */
export async function updateReportTemplate(
  id: string,
  updates: UpdateReportTemplateInput,
): Promise<ReportTemplate> {
  const response = await api.put(`${BASE_URL}/templates/${id}`, updates)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to update report template')
  return data.data
}

/**
 * Delete a report template
 */
export async function deleteReportTemplate(id: string): Promise<void> {
  const response = await api.delete(`${BASE_URL}/templates/${id}`)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to delete report template')
}

// ============================================================================
// Report Generation API Functions
// ============================================================================

/**
 * Generate a report from a template
 */
export async function generateReport(
  input: GenerateReportInput,
): Promise<ReportExecution> {
  const response = await api.post(`${BASE_URL}/generate`, input)
  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Failed to generate report')
  return data.data
}

/**
 * Get a report execution by ID
 */
export async function getReportExecution(id: string): Promise<ReportExecution> {
  const response = await api.get(`${BASE_URL}/executions/${id}`)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to get report execution')
  return data.data
}

/**
 * Get report executions, optionally filtered by report ID and options
 */
export async function getReportExecutions(
  reportId?: string,
  options?: GetReportExecutionsOptions,
): Promise<ReportExecution[]> {
  const params = new URLSearchParams()
  if (reportId) params.set('reportId', reportId)
  if (options?.status) params.set('status', options.status)
  if (options?.format) params.set('format', options.format)
  if (options?.limit) params.set('limit', options.limit.toString())
  if (options?.offset) params.set('offset', options.offset.toString())

  const queryString = params.toString()
  const url = queryString
    ? `${BASE_URL}/executions?${queryString}`
    : `${BASE_URL}/executions`
  const response = await api.get(url)
  const data = await response.json()
  if (!data.success)
    throw new Error(data.error || 'Failed to get report executions')
  return data.data
}

/**
 * Download a report by execution ID
 * Returns a Blob for client-side download handling
 */
export async function downloadReport(executionId: string): Promise<Blob> {
  const response = await api.get(`${BASE_URL}/download/${executionId}`)
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to download report')
  }
  return response.blob()
}

// ============================================================================
// Schedule API Functions
// ============================================================================

/**
 * Get schedules for a report
 */
export async function getSchedules(
  reportId: string,
): Promise<ReportSchedule[]> {
  const response = await api.get(`${BASE_URL}/templates/${reportId}/schedules`)
  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Failed to get schedules')
  return data.data
}

/**
 * Create a schedule for a report
 */
export async function createSchedule(
  reportId: string,
  schedule: CreateScheduleInput,
): Promise<ReportSchedule> {
  const response = await api.post(
    `${BASE_URL}/templates/${reportId}/schedules`,
    schedule,
  )
  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Failed to create schedule')
  return data.data
}

/**
 * Update a schedule
 */
export async function updateSchedule(
  scheduleId: string,
  updates: UpdateScheduleInput,
): Promise<ReportSchedule> {
  const response = await api.put(`${BASE_URL}/schedules/${scheduleId}`, updates)
  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Failed to update schedule')
  return data.data
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const response = await api.delete(`${BASE_URL}/schedules/${scheduleId}`)
  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Failed to delete schedule')
}

// ============================================================================
// Stats API Function
// ============================================================================

/**
 * Get report statistics
 */
export async function getReportStats(): Promise<ReportStats> {
  const response = await api.get(`${BASE_URL}/stats`)
  const data = await response.json()
  if (!data.success) throw new Error(data.error || 'Failed to get report stats')
  return data.data
}

// ============================================================================
// Export convenience API object
// ============================================================================

export const reportsApi = {
  // Templates
  getTemplates: getReportTemplates,
  getTemplateById: getReportTemplateById,
  createTemplate: createReportTemplate,
  updateTemplate: updateReportTemplate,
  deleteTemplate: deleteReportTemplate,

  // Generation & Executions
  generate: generateReport,
  getExecution: getReportExecution,
  getExecutions: getReportExecutions,
  download: downloadReport,

  // Schedules
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,

  // Stats
  getStats: getReportStats,
}

// Export mock data for testing and development
export const mockData = {
  templates: mockTemplates,
  executions: mockExecutions,
  schedules: mockSchedules,
}
