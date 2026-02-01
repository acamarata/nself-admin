// Activity library for nself-admin
// Provides mock activity data and API functions for activity feed management

import type {
  Activity,
  ActivityAction,
  ActivityActor,
  ActivityFeedOptions,
  ActivityFilter,
  ActivityResourceType,
  ActivityStats,
} from '@/types/activity'

// =============================================================================
// Mock Data
// =============================================================================

const mockActors: Record<string, ActivityActor> = {
  'user-1': {
    id: 'user-1',
    type: 'user',
    name: 'Admin User',
    email: 'admin@example.com',
  },
  'user-2': {
    id: 'user-2',
    type: 'user',
    name: 'John Developer',
    email: 'john@example.com',
  },
  'user-3': {
    id: 'user-3',
    type: 'user',
    name: 'Sarah Lead',
    email: 'sarah@example.com',
  },
  system: {
    id: 'system',
    type: 'system',
    name: 'nself System',
  },
  workflow: {
    id: 'workflow-1',
    type: 'workflow',
    name: 'Auto Backup Workflow',
  },
}

const mockActivities: Activity[] = [
  {
    id: 'act-1',
    actor: mockActors['user-1'],
    action: 'started',
    resource: { id: 'svc-postgres', type: 'service', name: 'postgres' },
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: 'act-2',
    actor: mockActors['user-2'],
    action: 'login',
    resource: { id: 'user-2', type: 'user', name: 'John Developer' },
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: 'act-3',
    actor: mockActors['user-1'],
    action: 'config_changed',
    resource: {
      id: 'config-dev',
      type: 'config',
      name: 'Development Environment',
    },
    changes: [
      { field: 'POSTGRES_PORT', oldValue: '5432', newValue: '5433' },
      { field: 'REDIS_ENABLED', oldValue: false, newValue: true },
    ],
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    ipAddress: '192.168.1.100',
  },
  {
    id: 'act-4',
    actor: mockActors['user-3'],
    action: 'deployed',
    resource: {
      id: 'deploy-staging-1',
      type: 'deployment',
      name: 'Staging Deployment',
    },
    metadata: {
      version: 'v0.4.4',
      environment: 'staging',
      duration: '45s',
    },
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    ipAddress: '192.168.1.102',
  },
  {
    id: 'act-5',
    actor: mockActors['system'],
    action: 'backup_created',
    resource: {
      id: 'backup-auto-1',
      type: 'backup',
      name: 'Auto Backup - postgres',
    },
    metadata: {
      size: '256MB',
      database: 'postgres',
      type: 'scheduled',
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
  },
  {
    id: 'act-6',
    actor: mockActors['user-1'],
    action: 'stopped',
    resource: { id: 'svc-redis', type: 'service', name: 'redis' },
    timestamp: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    ipAddress: '192.168.1.100',
  },
  {
    id: 'act-7',
    actor: mockActors['user-2'],
    action: 'created',
    resource: {
      id: 'secret-api-key',
      type: 'secret',
      name: 'External API Key',
    },
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    ipAddress: '192.168.1.101',
  },
  {
    id: 'act-8',
    actor: mockActors['user-3'],
    action: 'restarted',
    resource: { id: 'svc-hasura', type: 'service', name: 'hasura' },
    metadata: {
      reason: 'Memory limit reached',
    },
    timestamp: new Date(Date.now() - 25200000).toISOString(), // 7 hours ago
    ipAddress: '192.168.1.102',
  },
  {
    id: 'act-9',
    actor: mockActors['user-1'],
    action: 'password_changed',
    resource: { id: 'user-1', type: 'user', name: 'Admin User' },
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    ipAddress: '192.168.1.100',
  },
  {
    id: 'act-10',
    actor: mockActors['workflow'],
    action: 'backup_restored',
    resource: {
      id: 'backup-manual-1',
      type: 'backup',
      name: 'Manual Backup - postgres',
    },
    target: { id: 'db-postgres', type: 'database', name: 'postgres' },
    metadata: {
      backupDate: new Date(Date.now() - 172800000).toISOString(),
      restorePoint: 'before-migration',
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'act-11',
    actor: mockActors['user-2'],
    action: 'logout',
    resource: { id: 'user-2', type: 'user', name: 'John Developer' },
    timestamp: new Date(Date.now() - 90000000).toISOString(), // 25 hours ago
    ipAddress: '192.168.1.101',
  },
  {
    id: 'act-12',
    actor: mockActors['user-3'],
    action: 'deployed',
    resource: {
      id: 'deploy-prod-1',
      type: 'deployment',
      name: 'Production Deployment',
    },
    metadata: {
      version: 'v0.4.3',
      environment: 'production',
      duration: '62s',
      approvedBy: 'Admin User',
    },
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    ipAddress: '192.168.1.102',
  },
  {
    id: 'act-13',
    actor: mockActors['user-1'],
    action: 'secret_accessed',
    resource: {
      id: 'secret-db-pass',
      type: 'secret',
      name: 'Database Password',
    },
    metadata: {
      accessType: 'view',
      reason: 'Manual verification',
    },
    timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    ipAddress: '192.168.1.100',
  },
  {
    id: 'act-14',
    actor: mockActors['system'],
    action: 'started',
    resource: { id: 'svc-all', type: 'service', name: 'All Services' },
    metadata: {
      trigger: 'system-boot',
      services: ['postgres', 'hasura', 'redis', 'nginx', 'minio'],
    },
    timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  },
  {
    id: 'act-15',
    actor: mockActors['user-3'],
    action: 'rollback',
    resource: {
      id: 'deploy-prod-0',
      type: 'deployment',
      name: 'Production Rollback',
    },
    metadata: {
      fromVersion: 'v0.4.2',
      toVersion: 'v0.4.1',
      reason: 'Critical bug in authentication',
    },
    timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    ipAddress: '192.168.1.102',
  },
]

// =============================================================================
// Helper Functions
// =============================================================================

function matchesFilter(activity: Activity, filter: ActivityFilter): boolean {
  if (filter.actorId && activity.actor.id !== filter.actorId) {
    return false
  }

  if (filter.actorType && activity.actor.type !== filter.actorType) {
    return false
  }

  if (filter.action) {
    const actions = Array.isArray(filter.action)
      ? filter.action
      : [filter.action]
    if (!actions.includes(activity.action)) {
      return false
    }
  }

  if (filter.resourceType) {
    const types = Array.isArray(filter.resourceType)
      ? filter.resourceType
      : [filter.resourceType]
    if (!types.includes(activity.resource.type)) {
      return false
    }
  }

  if (filter.resourceId && activity.resource.id !== filter.resourceId) {
    return false
  }

  if (filter.tenantId && activity.tenantId !== filter.tenantId) {
    return false
  }

  if (filter.startDate) {
    const startDate = new Date(filter.startDate)
    const activityDate = new Date(activity.timestamp)
    if (activityDate < startDate) {
      return false
    }
  }

  if (filter.endDate) {
    const endDate = new Date(filter.endDate)
    const activityDate = new Date(activity.timestamp)
    if (activityDate > endDate) {
      return false
    }
  }

  if (filter.search) {
    const searchLower = filter.search.toLowerCase()
    const matchesSearch =
      activity.actor.name.toLowerCase().includes(searchLower) ||
      activity.resource.name.toLowerCase().includes(searchLower) ||
      activity.action.toLowerCase().includes(searchLower) ||
      (activity.actor.email &&
        activity.actor.email.toLowerCase().includes(searchLower))
    if (!matchesSearch) {
      return false
    }
  }

  return true
}

function generateTimeline(
  activities: Activity[],
  days: number,
): { date: string; count: number }[] {
  const timeline: { date: string; count: number }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const count = activities.filter((a) => {
      const activityDate = new Date(a.timestamp).toISOString().split('T')[0]
      return activityDate === dateStr
    }).length

    timeline.push({ date: dateStr, count })
  }

  return timeline
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get activity feed with filtering and pagination
 */
export async function getActivityFeed(
  options: ActivityFeedOptions = {},
): Promise<{
  activities: Activity[]
  total: number
  hasMore: boolean
  nextCursor?: string
}> {
  const { filter = {}, limit = 20, offset = 0, includeChanges = true } = options

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Filter activities
  let filtered = mockActivities.filter((activity) =>
    matchesFilter(activity, filter),
  )

  // Sort by timestamp (newest first)
  filtered = filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const total = filtered.length
  const paginated = filtered.slice(offset, offset + limit)

  // Optionally remove changes for smaller payload
  const activities = includeChanges
    ? paginated
    : paginated.map(({ changes: _changes, ...rest }) => rest)

  return {
    activities,
    total,
    hasMore: offset + limit < total,
    nextCursor: offset + limit < total ? String(offset + limit) : undefined,
  }
}

/**
 * Get a single activity by ID
 */
export async function getActivityById(id: string): Promise<Activity | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 50))

  const activity = mockActivities.find((a) => a.id === id)
  return activity || null
}

/**
 * Get activity statistics
 */
export async function getActivityStats(
  tenantId?: string,
): Promise<ActivityStats> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date(todayStart)
  monthStart.setMonth(monthStart.getMonth() - 1)

  // Filter by tenant if provided
  const activities = tenantId
    ? mockActivities.filter((a) => a.tenantId === tenantId)
    : mockActivities

  // Count activities by time period
  const totalToday = activities.filter(
    (a) => new Date(a.timestamp) >= todayStart,
  ).length
  const totalWeek = activities.filter(
    (a) => new Date(a.timestamp) >= weekStart,
  ).length
  const totalMonth = activities.filter(
    (a) => new Date(a.timestamp) >= monthStart,
  ).length

  // Count by action
  const byAction = {} as Record<ActivityAction, number>
  activities.forEach((a) => {
    byAction[a.action] = (byAction[a.action] || 0) + 1
  })

  // Count by resource type
  const byResource = {} as Record<ActivityResourceType, number>
  activities.forEach((a) => {
    byResource[a.resource.type] = (byResource[a.resource.type] || 0) + 1
  })

  // Get top actors
  const actorCounts = new Map<string, { actor: ActivityActor; count: number }>()
  activities.forEach((a) => {
    const existing = actorCounts.get(a.actor.id)
    if (existing) {
      existing.count++
    } else {
      actorCounts.set(a.actor.id, { actor: a.actor, count: 1 })
    }
  })
  const topActors = Array.from(actorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Generate timeline for last 7 days
  const timeline = generateTimeline(activities, 7)

  return {
    totalToday,
    totalWeek,
    totalMonth,
    byAction,
    byResource,
    topActors,
    timeline,
  }
}

/**
 * Get activities for a specific resource
 */
export async function getActivityForResource(
  resourceType: ActivityResourceType,
  resourceId: string,
): Promise<Activity[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 75))

  return mockActivities
    .filter(
      (a) => a.resource.type === resourceType && a.resource.id === resourceId,
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
}

/**
 * Get activities by a specific actor
 */
export async function getActivityByActor(actorId: string): Promise<Activity[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 75))

  return mockActivities
    .filter((a) => a.actor.id === actorId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
}

/**
 * Search activities by query string
 */
export async function searchActivity(query: string): Promise<Activity[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const queryLower = query.toLowerCase()

  return mockActivities
    .filter((a) => {
      return (
        a.actor.name.toLowerCase().includes(queryLower) ||
        a.resource.name.toLowerCase().includes(queryLower) ||
        a.action.toLowerCase().includes(queryLower) ||
        (a.actor.email && a.actor.email.toLowerCase().includes(queryLower)) ||
        (a.metadata &&
          JSON.stringify(a.metadata).toLowerCase().includes(queryLower))
      )
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
}

/**
 * Export activities in specified format
 */
export async function exportActivity(
  filter: ActivityFilter,
  format: 'json' | 'csv',
): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 150))

  const filtered = mockActivities.filter((activity) =>
    matchesFilter(activity, filter),
  )
  const sorted = filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  if (format === 'json') {
    return JSON.stringify(sorted, null, 2)
  }

  // CSV format
  const headers = [
    'ID',
    'Timestamp',
    'Actor ID',
    'Actor Name',
    'Actor Type',
    'Action',
    'Resource ID',
    'Resource Name',
    'Resource Type',
    'IP Address',
  ]

  const rows = sorted.map((a) => [
    a.id,
    a.timestamp,
    a.actor.id,
    a.actor.name,
    a.actor.type,
    a.action,
    a.resource.id,
    a.resource.name,
    a.resource.type,
    a.ipAddress || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Helper function to escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// =============================================================================
// Exports
// =============================================================================

export { mockActivities, mockActors }
