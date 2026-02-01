/**
 * Notifications Library
 *
 * Provides mock notification data and API functions for the notification system.
 * These functions simulate backend API calls and will be replaced with actual
 * API endpoints when the backend is implemented.
 */

import type {
  CreateNotificationInput,
  Notification,
  NotificationChannel,
  NotificationPreferences,
  NotificationPriority,
  NotificationStats,
  NotificationType,
} from '@/types/notification'

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-1',
    type: 'warning',
    title: 'New Login Detected',
    message:
      'A new login was detected from Chrome on macOS. If this was not you, please secure your account immediately.',
    priority: 'high',
    channels: ['in_app', 'email'],
    read: false,
    actionUrl: '/settings/security',
    actionLabel: 'Review Activity',
    metadata: {
      browser: 'Chrome',
      os: 'macOS',
      location: 'San Francisco, CA',
      ip: '192.168.1.100',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-002',
    userId: 'user-1',
    type: 'success',
    title: 'Deployment Successful',
    message:
      'Your application has been successfully deployed to production. All health checks passed.',
    priority: 'normal',
    channels: ['in_app', 'slack'],
    read: false,
    actionUrl: '/deployment/production',
    actionLabel: 'View Deployment',
    metadata: {
      environment: 'production',
      version: 'v1.2.3',
      duration: '45s',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-003',
    userId: 'user-1',
    type: 'warning',
    title: 'Database Storage Alert',
    message:
      'Your database is using 85% of allocated storage. Consider upgrading your plan or cleaning up old data.',
    priority: 'high',
    channels: ['in_app', 'email'],
    read: false,
    actionUrl: '/database/analyze',
    actionLabel: 'Analyze Storage',
    metadata: {
      usedStorage: '8.5GB',
      totalStorage: '10GB',
      percentUsed: 85,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-004',
    userId: 'user-1',
    type: 'info',
    title: 'Scheduled Maintenance',
    message:
      'Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM UTC. Services may experience brief interruptions.',
    priority: 'normal',
    channels: ['in_app', 'email'],
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    actionUrl: '/system/updates',
    actionLabel: 'View Schedule',
    metadata: {
      maintenanceStart: '2024-02-04T02:00:00Z',
      maintenanceEnd: '2024-02-04T04:00:00Z',
      affectedServices: ['API', 'Database', 'Storage'],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'notif-005',
    userId: 'user-1',
    type: 'error',
    title: 'Build Failed',
    message:
      'The latest build for staging environment failed. Check the logs for more details.',
    priority: 'urgent',
    channels: ['in_app', 'email', 'slack'],
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    actionUrl: '/deployment/staging',
    actionLabel: 'View Logs',
    metadata: {
      buildId: 'build-789',
      branch: 'feature/new-auth',
      errorType: 'TypeScript compilation error',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-006',
    userId: 'user-1',
    type: 'system',
    title: 'New Feature Available',
    message:
      'Real-time log streaming is now available. Enable it in your monitoring settings.',
    priority: 'low',
    channels: ['in_app'],
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actionUrl: '/monitor',
    actionLabel: 'Enable Feature',
    metadata: {
      featureId: 'real-time-logs',
      releaseVersion: 'v0.0.7',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'notif-007',
    userId: 'user-1',
    type: 'success',
    title: 'SSL Certificate Renewed',
    message:
      'Your SSL certificate has been automatically renewed and will expire in 90 days.',
    priority: 'normal',
    channels: ['in_app', 'email'],
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    actionUrl: '/config/ssl',
    actionLabel: 'View Certificate',
    metadata: {
      domain: 'app.example.com',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      provider: "Let's Encrypt",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'notif-008',
    userId: 'user-1',
    tenantId: 'tenant-1',
    type: 'info',
    title: 'Team Member Joined',
    message: 'John Doe has joined your organization as a Developer.',
    priority: 'low',
    channels: ['in_app'],
    read: false,
    actionUrl: '/settings/team',
    actionLabel: 'View Team',
    metadata: {
      memberId: 'user-123',
      memberName: 'John Doe',
      memberEmail: 'john@example.com',
      role: 'Developer',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'notif-009',
    userId: 'user-1',
    type: 'warning',
    title: 'API Rate Limit Warning',
    message:
      'Your API usage has reached 80% of the monthly limit. Consider upgrading your plan.',
    priority: 'normal',
    channels: ['in_app', 'email'],
    read: false,
    actionUrl: '/settings/billing',
    actionLabel: 'Upgrade Plan',
    metadata: {
      currentUsage: 80000,
      monthlyLimit: 100000,
      percentUsed: 80,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'notif-010',
    userId: 'user-1',
    type: 'success',
    title: 'Backup Completed',
    message:
      'Daily backup completed successfully. 156 MB backed up to cloud storage.',
    priority: 'low',
    channels: ['in_app'],
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    actionUrl: '/backups',
    actionLabel: 'View Backups',
    metadata: {
      backupId: 'backup-456',
      size: '156 MB',
      destination: 'S3',
      duration: '2m 15s',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
]

// Mock notification preferences
const mockPreferences: NotificationPreferences = {
  userId: 'user-1',
  channels: {
    in_app: true,
    email: true,
    push: false,
    slack: true,
    webhook: false,
  },
  digest: {
    enabled: true,
    frequency: 'daily',
    time: '09:00',
  },
  categories: {
    security: ['in_app', 'email', 'push'],
    billing: ['in_app', 'email'],
    system: ['in_app', 'email'],
    activity: ['in_app'],
    marketing: [],
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York',
  },
}

// Simulate network delay
const simulateDelay = (ms: number = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Get notifications for a user with optional filtering and pagination
 */
export async function getNotifications(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    type?: NotificationType
    priority?: NotificationPriority
  },
): Promise<{ notifications: Notification[]; total: number }> {
  await simulateDelay()

  let filtered = mockNotifications.filter((n) => n.userId === userId)

  if (options?.unreadOnly) {
    filtered = filtered.filter((n) => !n.read)
  }

  if (options?.type) {
    filtered = filtered.filter((n) => n.type === options.type)
  }

  if (options?.priority) {
    filtered = filtered.filter((n) => n.priority === options.priority)
  }

  // Sort by createdAt descending (newest first)
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const total = filtered.length
  const offset = options?.offset ?? 0
  const limit = options?.limit ?? 20

  const notifications = filtered.slice(offset, offset + limit)

  return { notifications, total }
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(
  id: string,
): Promise<Notification | null> {
  await simulateDelay()

  const notification = mockNotifications.find((n) => n.id === id)
  return notification ?? null
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id: string): Promise<Notification | null> {
  await simulateDelay()

  const notification = mockNotifications.find((n) => n.id === id)
  if (notification) {
    notification.read = true
    notification.readAt = new Date().toISOString()
    notification.updatedAt = new Date().toISOString()
  }

  return notification ?? null
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  await simulateDelay()

  let count = 0
  const now = new Date().toISOString()

  mockNotifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true
      n.readAt = now
      n.updatedAt = now
      count++
    }
  })

  return count
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<boolean> {
  await simulateDelay()

  const index = mockNotifications.findIndex((n) => n.id === id)
  if (index !== -1) {
    mockNotifications.splice(index, 1)
    return true
  }

  return false
}

/**
 * Get notification preferences for a user
 */
export async function getPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  await simulateDelay()

  // Return a copy with the requested userId
  return {
    ...mockPreferences,
    userId,
  }
}

/**
 * Update notification preferences for a user
 */
export async function updatePreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'userId'>>,
): Promise<NotificationPreferences> {
  await simulateDelay()

  // Merge with existing preferences
  const updated: NotificationPreferences = {
    ...mockPreferences,
    ...preferences,
    userId,
    channels: {
      ...mockPreferences.channels,
      ...(preferences.channels ?? {}),
    },
    digest: {
      ...mockPreferences.digest,
      ...(preferences.digest ?? {}),
    },
    categories: {
      ...mockPreferences.categories,
      ...(preferences.categories ?? {}),
    },
    quietHours: {
      ...mockPreferences.quietHours,
      ...(preferences.quietHours ?? {}),
    },
  }

  // Update the mock (in real implementation, this would update the database)
  Object.assign(mockPreferences, updated)

  return updated
}

/**
 * Get notification statistics for a user
 */
export async function getStats(userId: string): Promise<NotificationStats> {
  await simulateDelay()

  const userNotifications = mockNotifications.filter((n) => n.userId === userId)

  const stats: NotificationStats = {
    total: userNotifications.length,
    unread: userNotifications.filter((n) => !n.read).length,
    byType: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
      system: 0,
    },
    byChannel: {
      in_app: 0,
      email: 0,
      push: 0,
      slack: 0,
      webhook: 0,
    },
    byPriority: {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
    },
  }

  userNotifications.forEach((n) => {
    // Count by type
    if (n.type in stats.byType) {
      stats.byType[n.type]++
    }

    // Count by channels (a notification can have multiple channels)
    n.channels.forEach((channel) => {
      if (channel in stats.byChannel) {
        stats.byChannel[channel]++
      }
    })

    // Count by priority
    if (n.priority in stats.byPriority) {
      stats.byPriority[n.priority]++
    }
  })

  return stats
}

/**
 * Create a new notification (mock implementation)
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<Notification> {
  await simulateDelay()

  const now = new Date().toISOString()
  const notification: Notification = {
    id: `notif-${Date.now()}`,
    userId: input.userId ?? 'user-1',
    tenantId: input.tenantId,
    type: input.type,
    title: input.title,
    message: input.message,
    priority: input.priority ?? 'normal',
    channels: input.channels ?? ['in_app'],
    read: false,
    actionUrl: input.actionUrl,
    actionLabel: input.actionLabel,
    metadata: input.metadata,
    expiresAt: input.expiresAt,
    createdAt: now,
    updatedAt: now,
  }

  // Add to mock data
  mockNotifications.unshift(notification)

  return notification
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  await simulateDelay(100) // Faster for frequent polling

  return mockNotifications.filter((n) => n.userId === userId && !n.read).length
}

/**
 * Clear all read notifications for a user
 */
export async function clearReadNotifications(userId: string): Promise<number> {
  await simulateDelay()

  const initialLength = mockNotifications.length
  const indices: number[] = []

  mockNotifications.forEach((n, i) => {
    if (n.userId === userId && n.read) {
      indices.push(i)
    }
  })

  // Remove in reverse order to maintain correct indices
  for (let i = indices.length - 1; i >= 0; i--) {
    mockNotifications.splice(indices[i], 1)
  }

  return initialLength - mockNotifications.length
}

// Export types for convenience
export type {
  CreateNotificationInput,
  Notification,
  NotificationChannel,
  NotificationPreferences,
  NotificationPriority,
  NotificationStats,
  NotificationType,
}
