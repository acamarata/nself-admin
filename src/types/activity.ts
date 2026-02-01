// Activity types for v0.7.0

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'viewed'
  | 'started'
  | 'stopped'
  | 'restarted'
  | 'deployed'
  | 'rollback'
  | 'login'
  | 'logout'
  | 'password_changed'
  | 'invited'
  | 'removed'
  | 'role_changed'
  | 'backup_created'
  | 'backup_restored'
  | 'config_changed'
  | 'secret_accessed'

export type ActivityResourceType =
  | 'service'
  | 'database'
  | 'user'
  | 'tenant'
  | 'organization'
  | 'backup'
  | 'deployment'
  | 'config'
  | 'secret'
  | 'api_key'
  | 'workflow'
  | 'report'
  | 'dashboard'
  | 'notification'

export interface ActivityActor {
  id: string
  type: 'user' | 'system' | 'api' | 'workflow'
  name: string
  email?: string
  avatarUrl?: string
}

export interface ActivityResource {
  id: string
  type: ActivityResourceType
  name: string
  url?: string
}

export interface ActivityChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface Activity {
  id: string
  tenantId?: string
  actor: ActivityActor
  action: ActivityAction
  resource: ActivityResource
  target?: ActivityResource
  changes?: ActivityChange[]
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface ActivityFilter {
  actorId?: string
  actorType?: ActivityActor['type']
  action?: ActivityAction | ActivityAction[]
  resourceType?: ActivityResourceType | ActivityResourceType[]
  resourceId?: string
  tenantId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface ActivityStats {
  totalToday: number
  totalWeek: number
  totalMonth: number
  byAction: Record<ActivityAction, number>
  byResource: Record<ActivityResourceType, number>
  topActors: { actor: ActivityActor; count: number }[]
  timeline: { date: string; count: number }[]
}

export interface ActivityFeedOptions {
  filter?: ActivityFilter
  limit?: number
  offset?: number
  cursor?: string
  includeChanges?: boolean
}
