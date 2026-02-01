/**
 * Dashboard Library
 *
 * Provides mock dashboard data, widget templates, and API functions
 * for dashboard management in nself-admin.
 */

import type {
  Dashboard,
  DashboardStats,
  Widget,
  WidgetConfig,
  WidgetTemplate,
  WidgetType,
} from '@/types/dashboard'

// =============================================================================
// Widget Templates Library
// =============================================================================

export const widgetTemplates: WidgetTemplate[] = [
  // Metric Card - Single number display
  {
    id: 'tpl-metric-basic',
    name: 'Metric Card',
    description: 'Display a single metric value with optional trend indicator',
    category: 'Metrics',
    type: 'metric',
    defaultConfig: {
      title: 'Metric',
      icon: 'activity',
      color: '#3b82f6',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/value',
        refreshInterval: 30,
      },
    },
    defaultSize: { w: 3, h: 2 },
  },

  // Line Chart
  {
    id: 'tpl-chart-line',
    name: 'Line Chart',
    description: 'Time-series data visualization with smooth lines',
    category: 'Charts',
    type: 'chart',
    defaultConfig: {
      title: 'Line Chart',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/timeseries',
        refreshInterval: 60,
      },
      visualization: {
        chartType: 'line',
        showLegend: true,
        showGrid: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    },
    defaultSize: { w: 6, h: 4 },
  },

  // Bar Chart
  {
    id: 'tpl-chart-bar',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    category: 'Charts',
    type: 'chart',
    defaultConfig: {
      title: 'Bar Chart',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/categories',
        refreshInterval: 60,
      },
      visualization: {
        chartType: 'bar',
        showLegend: true,
        showGrid: true,
        stacked: false,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    },
    defaultSize: { w: 6, h: 4 },
  },

  // Pie/Donut Chart
  {
    id: 'tpl-chart-pie',
    name: 'Pie Chart',
    description: 'Show proportions of a whole',
    category: 'Charts',
    type: 'chart',
    defaultConfig: {
      title: 'Distribution',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/distribution',
        refreshInterval: 120,
      },
      visualization: {
        chartType: 'pie',
        showLegend: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    },
    defaultSize: { w: 4, h: 4 },
  },

  // Donut Chart
  {
    id: 'tpl-chart-donut',
    name: 'Donut Chart',
    description: 'Show proportions with center display area',
    category: 'Charts',
    type: 'chart',
    defaultConfig: {
      title: 'Distribution',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/distribution',
        refreshInterval: 120,
      },
      visualization: {
        chartType: 'donut',
        showLegend: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
    },
    defaultSize: { w: 4, h: 4 },
  },

  // Table
  {
    id: 'tpl-table-basic',
    name: 'Data Table',
    description: 'Display tabular data with sorting and filtering',
    category: 'Data',
    type: 'table',
    defaultConfig: {
      title: 'Data Table',
      dataSource: {
        type: 'api',
        endpoint: '/api/data/list',
        refreshInterval: 60,
      },
    },
    defaultSize: { w: 6, h: 4 },
  },

  // List
  {
    id: 'tpl-list-basic',
    name: 'List',
    description: 'Display items in a vertical list format',
    category: 'Data',
    type: 'list',
    defaultConfig: {
      title: 'Items',
      icon: 'list',
      dataSource: {
        type: 'api',
        endpoint: '/api/data/items',
        refreshInterval: 30,
      },
    },
    defaultSize: { w: 4, h: 4 },
  },

  // Gauge
  {
    id: 'tpl-gauge-basic',
    name: 'Gauge',
    description: 'Display a value on a gauge dial',
    category: 'Metrics',
    type: 'gauge',
    defaultConfig: {
      title: 'Performance',
      color: '#10b981',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/gauge',
        refreshInterval: 15,
      },
      thresholds: {
        warning: 70,
        critical: 90,
      },
    },
    defaultSize: { w: 3, h: 3 },
  },

  // Progress Bar
  {
    id: 'tpl-progress-basic',
    name: 'Progress Bar',
    description: 'Show progress toward a goal',
    category: 'Metrics',
    type: 'progress',
    defaultConfig: {
      title: 'Progress',
      color: '#3b82f6',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/progress',
        refreshInterval: 30,
      },
      thresholds: {
        warning: 50,
        critical: 25,
      },
    },
    defaultSize: { w: 4, h: 2 },
  },

  // Status Indicator
  {
    id: 'tpl-status-basic',
    name: 'Status Indicator',
    description: 'Display status with color-coded indicator',
    category: 'Status',
    type: 'status',
    defaultConfig: {
      title: 'Service Status',
      icon: 'circle',
      dataSource: {
        type: 'api',
        endpoint: '/api/status',
        refreshInterval: 10,
      },
    },
    defaultSize: { w: 2, h: 2 },
  },

  // Timeline
  {
    id: 'tpl-timeline-basic',
    name: 'Timeline',
    description: 'Display events in chronological order',
    category: 'Data',
    type: 'timeline',
    defaultConfig: {
      title: 'Recent Activity',
      icon: 'clock',
      dataSource: {
        type: 'api',
        endpoint: '/api/events/recent',
        refreshInterval: 30,
      },
    },
    defaultSize: { w: 4, h: 5 },
  },

  // Area Chart
  {
    id: 'tpl-chart-area',
    name: 'Area Chart',
    description: 'Time-series data with filled area visualization',
    category: 'Charts',
    type: 'chart',
    defaultConfig: {
      title: 'Trend',
      dataSource: {
        type: 'api',
        endpoint: '/api/metrics/timeseries',
        refreshInterval: 60,
      },
      visualization: {
        chartType: 'area',
        showLegend: true,
        showGrid: true,
        stacked: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b'],
      },
    },
    defaultSize: { w: 6, h: 4 },
  },
]

// =============================================================================
// Mock Dashboard Data
// =============================================================================

const mockDashboards: Dashboard[] = [
  {
    id: 'dash-1',
    name: 'System Overview',
    description: 'Main system monitoring dashboard with key metrics',
    icon: 'layout-dashboard',
    isDefault: true,
    isPublic: false,
    layout: 'grid',
    columns: 12,
    rowHeight: 60,
    widgets: [
      {
        id: 'w-1',
        type: 'metric',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          title: 'Active Services',
          icon: 'server',
          color: '#10b981',
          dataSource: {
            type: 'api',
            endpoint: '/api/services/count',
            refreshInterval: 30,
          },
        },
      },
      {
        id: 'w-2',
        type: 'metric',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          title: 'CPU Usage',
          subtitle: 'Last 5 minutes',
          icon: 'cpu',
          color: '#3b82f6',
          dataSource: {
            type: 'api',
            endpoint: '/api/metrics/cpu',
            refreshInterval: 15,
          },
          thresholds: {
            warning: 70,
            critical: 90,
          },
        },
      },
      {
        id: 'w-3',
        type: 'metric',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          title: 'Memory Usage',
          subtitle: 'Current',
          icon: 'memory-stick',
          color: '#8b5cf6',
          dataSource: {
            type: 'api',
            endpoint: '/api/metrics/memory',
            refreshInterval: 15,
          },
          thresholds: {
            warning: 80,
            critical: 95,
          },
        },
      },
      {
        id: 'w-4',
        type: 'metric',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          title: 'Disk Usage',
          icon: 'hard-drive',
          color: '#f59e0b',
          dataSource: {
            type: 'api',
            endpoint: '/api/metrics/disk',
            refreshInterval: 60,
          },
          thresholds: {
            warning: 75,
            critical: 90,
          },
        },
      },
      {
        id: 'w-5',
        type: 'chart',
        position: { x: 0, y: 2, w: 8, h: 4 },
        config: {
          title: 'Request Rate',
          subtitle: 'Requests per second',
          dataSource: {
            type: 'api',
            endpoint: '/api/metrics/requests/timeseries',
            refreshInterval: 30,
          },
          visualization: {
            chartType: 'line',
            showLegend: true,
            showGrid: true,
            colors: ['#3b82f6', '#10b981'],
          },
        },
      },
      {
        id: 'w-6',
        type: 'status',
        position: { x: 8, y: 2, w: 4, h: 4 },
        config: {
          title: 'Service Health',
          icon: 'heart-pulse',
          dataSource: {
            type: 'api',
            endpoint: '/api/services/health',
            refreshInterval: 10,
          },
        },
      },
      {
        id: 'w-7',
        type: 'timeline',
        position: { x: 0, y: 6, w: 4, h: 4 },
        config: {
          title: 'Recent Events',
          icon: 'clock',
          dataSource: {
            type: 'api',
            endpoint: '/api/events/recent',
            refreshInterval: 30,
          },
        },
      },
      {
        id: 'w-8',
        type: 'table',
        position: { x: 4, y: 6, w: 8, h: 4 },
        config: {
          title: 'Active Connections',
          dataSource: {
            type: 'api',
            endpoint: '/api/connections/active',
            refreshInterval: 15,
          },
        },
      },
    ],
    refreshInterval: 30,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'dash-2',
    name: 'Database Performance',
    description: 'PostgreSQL and Hasura monitoring',
    icon: 'database',
    isDefault: false,
    isPublic: false,
    layout: 'grid',
    columns: 12,
    rowHeight: 60,
    widgets: [
      {
        id: 'w-db-1',
        type: 'gauge',
        position: { x: 0, y: 0, w: 4, h: 3 },
        config: {
          title: 'Query Performance',
          subtitle: 'Avg response time',
          color: '#10b981',
          dataSource: {
            type: 'api',
            endpoint: '/api/database/query-time',
            refreshInterval: 15,
          },
          thresholds: {
            warning: 100,
            critical: 500,
          },
        },
      },
      {
        id: 'w-db-2',
        type: 'metric',
        position: { x: 4, y: 0, w: 4, h: 2 },
        config: {
          title: 'Active Connections',
          icon: 'plug',
          color: '#3b82f6',
          dataSource: {
            type: 'api',
            endpoint: '/api/database/connections',
            refreshInterval: 10,
          },
          thresholds: {
            warning: 80,
            critical: 95,
          },
        },
      },
      {
        id: 'w-db-3',
        type: 'metric',
        position: { x: 8, y: 0, w: 4, h: 2 },
        config: {
          title: 'Cache Hit Rate',
          icon: 'zap',
          color: '#10b981',
          dataSource: {
            type: 'api',
            endpoint: '/api/database/cache-hit-rate',
            refreshInterval: 30,
          },
          thresholds: {
            warning: 90,
            critical: 80,
          },
        },
      },
      {
        id: 'w-db-4',
        type: 'chart',
        position: { x: 0, y: 3, w: 6, h: 4 },
        config: {
          title: 'Queries Per Second',
          dataSource: {
            type: 'api',
            endpoint: '/api/database/qps',
            refreshInterval: 30,
          },
          visualization: {
            chartType: 'area',
            showLegend: true,
            showGrid: true,
            stacked: true,
            colors: ['#3b82f6', '#10b981', '#f59e0b'],
          },
        },
      },
      {
        id: 'w-db-5',
        type: 'chart',
        position: { x: 6, y: 3, w: 6, h: 4 },
        config: {
          title: 'Query Distribution',
          dataSource: {
            type: 'api',
            endpoint: '/api/database/query-types',
            refreshInterval: 60,
          },
          visualization: {
            chartType: 'donut',
            showLegend: true,
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          },
        },
      },
      {
        id: 'w-db-6',
        type: 'table',
        position: { x: 0, y: 7, w: 12, h: 4 },
        config: {
          title: 'Slow Queries',
          subtitle: 'Queries taking > 100ms',
          dataSource: {
            type: 'api',
            endpoint: '/api/database/slow-queries',
            refreshInterval: 60,
          },
        },
      },
    ],
    refreshInterval: 30,
    createdBy: 'admin',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-28T00:00:00Z',
  },
  {
    id: 'dash-3',
    name: 'API Analytics',
    description: 'GraphQL and REST API usage analytics',
    icon: 'activity',
    isDefault: false,
    isPublic: true,
    layout: 'grid',
    columns: 12,
    rowHeight: 60,
    widgets: [
      {
        id: 'w-api-1',
        type: 'metric',
        position: { x: 0, y: 0, w: 3, h: 2 },
        config: {
          title: 'Total Requests',
          subtitle: 'Last 24 hours',
          icon: 'arrow-up-right',
          color: '#3b82f6',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/total-requests',
            refreshInterval: 60,
          },
        },
      },
      {
        id: 'w-api-2',
        type: 'metric',
        position: { x: 3, y: 0, w: 3, h: 2 },
        config: {
          title: 'Error Rate',
          subtitle: 'Last hour',
          icon: 'alert-triangle',
          color: '#ef4444',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/error-rate',
            refreshInterval: 30,
          },
          thresholds: {
            warning: 1,
            critical: 5,
          },
        },
      },
      {
        id: 'w-api-3',
        type: 'metric',
        position: { x: 6, y: 0, w: 3, h: 2 },
        config: {
          title: 'Avg Latency',
          subtitle: 'P95',
          icon: 'timer',
          color: '#f59e0b',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/latency',
            refreshInterval: 30,
          },
          thresholds: {
            warning: 200,
            critical: 500,
          },
        },
      },
      {
        id: 'w-api-4',
        type: 'progress',
        position: { x: 9, y: 0, w: 3, h: 2 },
        config: {
          title: 'Rate Limit',
          subtitle: 'Usage %',
          color: '#8b5cf6',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/rate-limit',
            refreshInterval: 15,
          },
          thresholds: {
            warning: 70,
            critical: 90,
          },
        },
      },
      {
        id: 'w-api-5',
        type: 'chart',
        position: { x: 0, y: 2, w: 12, h: 4 },
        config: {
          title: 'Request Volume',
          subtitle: 'Requests over time',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/volume',
            refreshInterval: 60,
          },
          visualization: {
            chartType: 'line',
            showLegend: true,
            showGrid: true,
            colors: ['#3b82f6', '#10b981', '#ef4444'],
          },
        },
      },
      {
        id: 'w-api-6',
        type: 'list',
        position: { x: 0, y: 6, w: 4, h: 4 },
        config: {
          title: 'Top Endpoints',
          icon: 'trending-up',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/top-endpoints',
            refreshInterval: 60,
          },
        },
      },
      {
        id: 'w-api-7',
        type: 'chart',
        position: { x: 4, y: 6, w: 4, h: 4 },
        config: {
          title: 'Response Codes',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/response-codes',
            refreshInterval: 60,
          },
          visualization: {
            chartType: 'bar',
            showLegend: false,
            showGrid: true,
            colors: ['#10b981', '#f59e0b', '#ef4444'],
          },
        },
      },
      {
        id: 'w-api-8',
        type: 'timeline',
        position: { x: 8, y: 6, w: 4, h: 4 },
        config: {
          title: 'Recent Errors',
          icon: 'alert-circle',
          dataSource: {
            type: 'api',
            endpoint: '/api/analytics/recent-errors',
            refreshInterval: 30,
          },
        },
      },
    ],
    refreshInterval: 60,
    createdBy: 'admin',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-30T00:00:00Z',
  },
]

// =============================================================================
// In-Memory Store (for mock API)
// =============================================================================

let dashboards: Dashboard[] = [...mockDashboards]

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get all dashboards, optionally filtered by tenant
 */
export async function getDashboards(tenantId?: string): Promise<Dashboard[]> {
  // Simulate async operation
  await simulateDelay()

  if (tenantId) {
    return dashboards.filter((d) => d.tenantId === tenantId || !d.tenantId)
  }

  return dashboards
}

/**
 * Get a single dashboard by ID
 */
export async function getDashboardById(id: string): Promise<Dashboard | null> {
  await simulateDelay()

  const dashboard = dashboards.find((d) => d.id === id)
  return dashboard || null
}

/**
 * Create a new dashboard
 */
export async function createDashboard(
  input: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Dashboard> {
  await simulateDelay()

  const now = new Date().toISOString()
  const newDashboard: Dashboard = {
    ...input,
    id: `dash-${generateId()}`,
    createdAt: now,
    updatedAt: now,
  }

  dashboards.push(newDashboard)
  return newDashboard
}

/**
 * Update an existing dashboard
 */
export async function updateDashboard(
  id: string,
  updates: Partial<Omit<Dashboard, 'id' | 'createdAt' | 'createdBy'>>,
): Promise<Dashboard | null> {
  await simulateDelay()

  const index = dashboards.findIndex((d) => d.id === id)
  if (index === -1) {
    return null
  }

  const updated: Dashboard = {
    ...dashboards[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  dashboards[index] = updated
  return updated
}

/**
 * Delete a dashboard
 */
export async function deleteDashboard(id: string): Promise<boolean> {
  await simulateDelay()

  const index = dashboards.findIndex((d) => d.id === id)
  if (index === -1) {
    return false
  }

  dashboards.splice(index, 1)
  return true
}

/**
 * Add a widget to a dashboard
 */
export async function addWidget(
  dashboardId: string,
  widget: Omit<Widget, 'id'>,
): Promise<Widget | null> {
  await simulateDelay()

  const dashboard = dashboards.find((d) => d.id === dashboardId)
  if (!dashboard) {
    return null
  }

  const newWidget: Widget = {
    ...widget,
    id: `w-${generateId()}`,
  }

  dashboard.widgets.push(newWidget)
  dashboard.updatedAt = new Date().toISOString()

  return newWidget
}

/**
 * Update a widget in a dashboard
 */
export async function updateWidget(
  dashboardId: string,
  widgetId: string,
  updates: Partial<Omit<Widget, 'id'>>,
): Promise<Widget | null> {
  await simulateDelay()

  const dashboard = dashboards.find((d) => d.id === dashboardId)
  if (!dashboard) {
    return null
  }

  const widgetIndex = dashboard.widgets.findIndex((w) => w.id === widgetId)
  if (widgetIndex === -1) {
    return null
  }

  const updatedWidget: Widget = {
    ...dashboard.widgets[widgetIndex],
    ...updates,
    config: {
      ...dashboard.widgets[widgetIndex].config,
      ...(updates.config || {}),
    } as WidgetConfig,
  }

  dashboard.widgets[widgetIndex] = updatedWidget
  dashboard.updatedAt = new Date().toISOString()

  return updatedWidget
}

/**
 * Remove a widget from a dashboard
 */
export async function removeWidget(
  dashboardId: string,
  widgetId: string,
): Promise<boolean> {
  await simulateDelay()

  const dashboard = dashboards.find((d) => d.id === dashboardId)
  if (!dashboard) {
    return false
  }

  const widgetIndex = dashboard.widgets.findIndex((w) => w.id === widgetId)
  if (widgetIndex === -1) {
    return false
  }

  dashboard.widgets.splice(widgetIndex, 1)
  dashboard.updatedAt = new Date().toISOString()

  return true
}

/**
 * Get all widget templates
 */
export async function getWidgetTemplates(): Promise<WidgetTemplate[]> {
  await simulateDelay()
  return widgetTemplates
}

/**
 * Get widget templates by category
 */
export async function getWidgetTemplatesByCategory(
  category: string,
): Promise<WidgetTemplate[]> {
  await simulateDelay()
  return widgetTemplates.filter(
    (t) => t.category.toLowerCase() === category.toLowerCase(),
  )
}

/**
 * Get a single widget template by ID
 */
export async function getWidgetTemplateById(
  id: string,
): Promise<WidgetTemplate | null> {
  await simulateDelay()
  return widgetTemplates.find((t) => t.id === id) || null
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  await simulateDelay()

  const widgetTypeCounts: Record<WidgetType, number> = {
    metric: 0,
    chart: 0,
    table: 0,
    list: 0,
    map: 0,
    gauge: 0,
    progress: 0,
    status: 0,
    timeline: 0,
    calendar: 0,
    text: 0,
    embed: 0,
  }

  let totalWidgets = 0

  for (const dashboard of dashboards) {
    for (const widget of dashboard.widgets) {
      totalWidgets++
      widgetTypeCounts[widget.type]++
    }
  }

  // Mock view counts (in a real app, this would come from analytics)
  const mostViewed = dashboards.slice(0, 3).map((d, index) => ({
    id: d.id,
    name: d.name,
    views: 1000 - index * 250,
  }))

  return {
    totalDashboards: dashboards.length,
    totalWidgets,
    byType: widgetTypeCounts,
    mostViewed,
  }
}

/**
 * Clone a dashboard
 */
export async function cloneDashboard(
  id: string,
  newName?: string,
): Promise<Dashboard | null> {
  await simulateDelay()

  const original = dashboards.find((d) => d.id === id)
  if (!original) {
    return null
  }

  const now = new Date().toISOString()
  const cloned: Dashboard = {
    ...original,
    id: `dash-${generateId()}`,
    name: newName || `${original.name} (Copy)`,
    isDefault: false,
    widgets: original.widgets.map((w) => ({
      ...w,
      id: `w-${generateId()}`,
    })),
    createdAt: now,
    updatedAt: now,
  }

  dashboards.push(cloned)
  return cloned
}

/**
 * Reset dashboards to initial mock data
 */
export function resetDashboards(): void {
  dashboards = [...mockDashboards]
}

/**
 * Get widget template categories
 */
export function getWidgetCategories(): string[] {
  const categories = new Set<string>()
  for (const template of widgetTemplates) {
    categories.add(template.category)
  }
  return Array.from(categories).sort()
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a random ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Simulate network delay for mock API
 */
function simulateDelay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =============================================================================
// Exports
// =============================================================================

export type { Dashboard, DashboardStats, Widget, WidgetConfig, WidgetTemplate }
