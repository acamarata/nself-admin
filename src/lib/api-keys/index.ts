/**
 * API Keys library for managing API key operations
 */

import type {
  ApiKey,
  ApiKeyLog,
  ApiKeyRateLimit,
  ApiKeyScope,
  ApiKeyStats,
  ApiKeyUsage,
  ApiKeyUsageStats,
  CreateApiKeyInput,
  CreateApiKeyResult,
} from '@/types/api-key'

// =============================================================================
// Mock Data
// =============================================================================

const mockApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    description: 'Main production API access for external integrations',
    keyPrefix: 'nself_pk',
    keyHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.SdVa5YzBLCFH9O',
    status: 'active',
    scope: 'admin',
    rateLimit: { requests: 1000, window: 3600 },
    allowedOrigins: ['https://app.example.com', 'https://api.example.com'],
    usageCount: 15420,
    lastUsedAt: new Date().toISOString(),
    lastUsedIp: '192.168.1.100',
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'key-2',
    name: 'Development Key',
    description: 'Development and testing purposes',
    keyPrefix: 'nself_dk',
    keyHash: '$2b$12$xKv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.SdVa5YzBLCFH9P',
    status: 'active',
    scope: 'write',
    rateLimit: { requests: 500, window: 3600 },
    allowedIps: ['127.0.0.1', '::1', '192.168.1.0/24'],
    usageCount: 8750,
    lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
    lastUsedIp: '127.0.0.1',
    createdBy: 'developer',
    createdAt: '2026-01-05T10:30:00Z',
    updatedAt: '2026-01-20T14:15:00Z',
  },
  {
    id: 'key-3',
    name: 'Read-Only Analytics Key',
    description: 'Analytics dashboard read access',
    keyPrefix: 'nself_ro',
    keyHash: '$2b$12$aKv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.SdVa5YzBLCFH9Q',
    status: 'active',
    scope: 'read',
    rateLimit: { requests: 2000, window: 3600 },
    permissions: [
      { resource: 'analytics', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
    usageCount: 42100,
    lastUsedAt: new Date(Date.now() - 300000).toISOString(),
    lastUsedIp: '10.0.0.50',
    createdBy: 'admin',
    createdAt: '2025-12-15T08:00:00Z',
    updatedAt: '2026-01-10T09:30:00Z',
  },
  {
    id: 'key-4',
    name: 'CI/CD Pipeline Key',
    description: 'Automated deployment pipeline access',
    keyPrefix: 'nself_ci',
    keyHash: '$2b$12$bKv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.SdVa5YzBLCFH9R',
    status: 'active',
    scope: 'custom',
    rateLimit: { requests: 100, window: 60 },
    permissions: [
      { resource: 'deployments', actions: ['create', 'read', 'execute'] },
      { resource: 'builds', actions: ['create', 'read'] },
      { resource: 'logs', actions: ['read'] },
    ],
    allowedIps: ['203.0.113.0/24'],
    expiresAt: '2026-06-01T00:00:00Z',
    usageCount: 1250,
    lastUsedAt: new Date(Date.now() - 7200000).toISOString(),
    lastUsedIp: '203.0.113.10',
    createdBy: 'devops',
    createdAt: '2026-01-10T16:45:00Z',
    updatedAt: '2026-01-25T11:20:00Z',
  },
  {
    id: 'key-5',
    name: 'Legacy Integration Key',
    description: 'Deprecated - scheduled for removal',
    keyPrefix: 'nself_lg',
    keyHash: '$2b$12$cKv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.SdVa5YzBLCFH9S',
    status: 'inactive',
    scope: 'write',
    rateLimit: { requests: 200, window: 3600 },
    usageCount: 95000,
    lastUsedAt: '2026-01-01T12:00:00Z',
    lastUsedIp: '172.16.0.5',
    createdBy: 'admin',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-01T12:00:00Z',
  },
]

const mockUsageData: ApiKeyUsage[] = [
  {
    id: 'usage-1',
    keyId: 'key-1',
    endpoint: '/api/data/export',
    method: 'GET',
    statusCode: 200,
    responseTime: 45,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (compatible; IntegrationBot/1.0)',
    requestSize: 128,
    responseSize: 15420,
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'usage-2',
    keyId: 'key-1',
    endpoint: '/api/data/import',
    method: 'POST',
    statusCode: 201,
    responseTime: 120,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (compatible; IntegrationBot/1.0)',
    requestSize: 8450,
    responseSize: 256,
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'usage-3',
    keyId: 'key-2',
    endpoint: '/api/users',
    method: 'GET',
    statusCode: 200,
    responseTime: 32,
    ipAddress: '127.0.0.1',
    userAgent: 'curl/7.79.1',
    requestSize: 64,
    responseSize: 2048,
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 'usage-4',
    keyId: 'key-3',
    endpoint: '/api/analytics/dashboard',
    method: 'GET',
    statusCode: 200,
    responseTime: 78,
    ipAddress: '10.0.0.50',
    userAgent: 'AnalyticsDashboard/2.1',
    requestSize: 96,
    responseSize: 45678,
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'usage-5',
    keyId: 'key-1',
    endpoint: '/api/data/query',
    method: 'POST',
    statusCode: 429,
    responseTime: 5,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (compatible; IntegrationBot/1.0)',
    requestSize: 512,
    responseSize: 128,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
]

const mockLogs: ApiKeyLog[] = [
  {
    id: 'log-1',
    keyId: 'key-1',
    action: 'used',
    details: { endpoint: '/api/data/export', statusCode: 200 },
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'log-2',
    keyId: 'key-1',
    action: 'rate_limited',
    details: {
      endpoint: '/api/data/query',
      currentRequests: 1001,
      limit: 1000,
    },
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'log-3',
    keyId: 'key-2',
    action: 'updated',
    details: { field: 'rateLimit', oldValue: 300, newValue: 500 },
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log-4',
    keyId: 'key-5',
    action: 'deactivated',
    details: { reason: 'Scheduled deprecation' },
    ipAddress: '10.0.0.1',
    timestamp: '2026-01-01T12:00:00Z',
  },
  {
    id: 'log-5',
    keyId: 'key-4',
    action: 'created',
    details: { scope: 'custom', permissions: 3 },
    ipAddress: '10.0.0.1',
    timestamp: '2026-01-10T16:45:00Z',
  },
]

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate an 8-character prefix for API keys
 */
export function generateKeyPrefix(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let prefix = 'nself_'
  for (let i = 0; i < 2; i++) {
    prefix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix
}

/**
 * Mask an API key showing only the prefix
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '****'
  const prefix = key.substring(0, 8)
  return `${prefix}****`
}

/**
 * Generate a secure random API key
 */
function generateSecretKey(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let key = prefix + '_'
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

/**
 * Generate a mock bcrypt hash (in production, use actual bcrypt)
 */
function generateMockHash(): string {
  return `$2b$12$${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
}

// =============================================================================
// API Key Management Functions
// =============================================================================

/**
 * Get all API keys, optionally filtered by tenant
 */
export async function getApiKeys(tenantId?: string): Promise<ApiKey[]> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (tenantId) {
    return mockApiKeys.filter((key) => key.tenantId === tenantId)
  }
  return [...mockApiKeys]
}

/**
 * Get a single API key by ID
 */
export async function getApiKeyById(id: string): Promise<ApiKey | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return mockApiKeys.find((key) => key.id === id) || null
}

/**
 * Create a new API key
 */
export async function createApiKey(
  input: CreateApiKeyInput,
): Promise<CreateApiKeyResult> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const prefix = generateKeyPrefix()
  const secretKey = generateSecretKey(prefix)
  const now = new Date().toISOString()

  const newKey: ApiKey = {
    id: `key-${Date.now()}`,
    name: input.name,
    description: input.description,
    keyPrefix: prefix,
    keyHash: generateMockHash(),
    status: 'active',
    scope: input.scope,
    permissions: input.permissions,
    rateLimit: input.rateLimit || { requests: 1000, window: 3600 },
    allowedIps: input.allowedIps,
    allowedOrigins: input.allowedOrigins,
    expiresAt: input.expiresAt,
    usageCount: 0,
    createdBy: 'current-user',
    createdAt: now,
    updatedAt: now,
  }

  mockApiKeys.push(newKey)

  return {
    key: newKey,
    secretKey, // Only returned once on creation
  }
}

/**
 * Update an existing API key
 */
export async function updateApiKey(
  id: string,
  updates: Partial<
    Pick<
      ApiKey,
      | 'name'
      | 'description'
      | 'status'
      | 'rateLimit'
      | 'allowedIps'
      | 'allowedOrigins'
      | 'permissions'
      | 'expiresAt'
    >
  >,
): Promise<ApiKey | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const index = mockApiKeys.findIndex((key) => key.id === id)
  if (index === -1) return null

  mockApiKeys[index] = {
    ...mockApiKeys[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return mockApiKeys[index]
}

/**
 * Revoke an API key (sets status to revoked)
 */
export async function revokeApiKey(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const key = mockApiKeys.find((k) => k.id === id)
  if (!key) return false

  key.status = 'revoked'
  key.updatedAt = new Date().toISOString()

  return true
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const index = mockApiKeys.findIndex((key) => key.id === id)
  if (index === -1) return false

  mockApiKeys.splice(index, 1)
  return true
}

// =============================================================================
// Usage and Analytics Functions
// =============================================================================

/**
 * Get usage data for an API key
 */
export async function getApiKeyUsage(
  keyId: string,
  options?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  },
): Promise<ApiKeyUsage[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  let usage = mockUsageData.filter((u) => u.keyId === keyId)

  if (options?.startDate) {
    usage = usage.filter((u) => u.timestamp >= options.startDate!)
  }

  if (options?.endDate) {
    usage = usage.filter((u) => u.timestamp <= options.endDate!)
  }

  const offset = options?.offset || 0
  const limit = options?.limit || 50

  return usage.slice(offset, offset + limit)
}

/**
 * Get usage statistics for an API key
 */
export async function getApiKeyUsageStats(
  keyId: string,
): Promise<ApiKeyUsageStats> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const usage = mockUsageData.filter((u) => u.keyId === keyId)
  const successful = usage.filter(
    (u) => u.statusCode >= 200 && u.statusCode < 400,
  )
  const failed = usage.filter((u) => u.statusCode >= 400)

  const endpointCounts: Record<string, number> = {}
  const statusCounts: Record<number, number> = {}
  const endpointTimes: Record<string, number[]> = {}

  for (const u of usage) {
    endpointCounts[u.endpoint] = (endpointCounts[u.endpoint] || 0) + 1
    statusCounts[u.statusCode] = (statusCounts[u.statusCode] || 0) + 1
    if (!endpointTimes[u.endpoint]) endpointTimes[u.endpoint] = []
    endpointTimes[u.endpoint].push(u.responseTime)
  }

  const topEndpoints = Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({
      endpoint,
      count,
      avgTime:
        endpointTimes[endpoint].reduce((a, b) => a + b, 0) /
        endpointTimes[endpoint].length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Generate mock hourly data
  const requestsByHour: { hour: string; count: number }[] = []
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(Date.now() - i * 3600000).toISOString().slice(0, 13)
    requestsByHour.push({
      hour,
      count: Math.floor(Math.random() * 100) + 10,
    })
  }

  const avgResponseTime =
    usage.length > 0
      ? usage.reduce((a, b) => a + b.responseTime, 0) / usage.length
      : 0

  return {
    keyId,
    totalRequests: usage.length * 100, // Simulated larger dataset
    successfulRequests: successful.length * 100,
    failedRequests: failed.length * 100,
    averageResponseTime: Math.round(avgResponseTime),
    requestsByEndpoint: endpointCounts,
    requestsByStatus: statusCounts,
    requestsByHour,
    topEndpoints,
    errorRate: usage.length > 0 ? (failed.length / usage.length) * 100 : 0,
  }
}

/**
 * Get current rate limit status for an API key
 */
export async function getApiKeyRateLimit(
  keyId: string,
): Promise<ApiKeyRateLimit | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const key = mockApiKeys.find((k) => k.id === keyId)
  if (!key || !key.rateLimit) return null

  // Simulate current usage
  const currentRequests = Math.floor(Math.random() * key.rateLimit.requests)
  const resetAt = new Date(
    Date.now() + Math.floor(Math.random() * key.rateLimit.window * 1000),
  ).toISOString()

  return {
    keyId,
    currentRequests,
    limit: key.rateLimit.requests,
    window: key.rateLimit.window,
    resetAt,
    isLimited: currentRequests >= key.rateLimit.requests,
  }
}

/**
 * Get logs for an API key
 */
export async function getApiKeyLogs(
  keyId: string,
  options?: {
    limit?: number
    offset?: number
    action?: ApiKeyLog['action']
  },
): Promise<ApiKeyLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  let logs = mockLogs.filter((log) => log.keyId === keyId)

  if (options?.action) {
    logs = logs.filter((log) => log.action === options.action)
  }

  const offset = options?.offset || 0
  const limit = options?.limit || 50

  return logs.slice(offset, offset + limit)
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate an API key (check if it exists and is active)
 */
export async function validateApiKey(
  key: string,
): Promise<{ valid: boolean; key?: ApiKey; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  if (!key || key.length < 10) {
    return { valid: false, error: 'Invalid key format' }
  }

  const prefix = key.substring(0, 8)
  const apiKey = mockApiKeys.find((k) => k.keyPrefix === prefix)

  if (!apiKey) {
    return { valid: false, error: 'API key not found' }
  }

  if (apiKey.status === 'revoked') {
    return { valid: false, error: 'API key has been revoked' }
  }

  if (apiKey.status === 'inactive') {
    return { valid: false, error: 'API key is inactive' }
  }

  if (
    apiKey.status === 'expired' ||
    (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date())
  ) {
    return { valid: false, error: 'API key has expired' }
  }

  // Update last used
  apiKey.lastUsedAt = new Date().toISOString()
  apiKey.usageCount++

  return { valid: true, key: apiKey }
}

// =============================================================================
// Statistics Functions
// =============================================================================

/**
 * Get overall API key statistics
 */
export async function getApiKeyStats(): Promise<ApiKeyStats> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const byScope: Record<ApiKeyScope, number> = {
    read: 0,
    write: 0,
    admin: 0,
    custom: 0,
  }

  let activeKeys = 0
  let expiredKeys = 0
  let revokedKeys = 0

  for (const key of mockApiKeys) {
    byScope[key.scope]++

    if (key.status === 'active') activeKeys++
    else if (key.status === 'expired') expiredKeys++
    else if (key.status === 'revoked') revokedKeys++
  }

  // Calculate total requests in last 24h (simulated)
  const totalRequests24h = mockApiKeys.reduce(
    (sum, key) => sum + Math.floor(key.usageCount * 0.1),
    0,
  )

  // Top keys by usage
  const topKeys = [...mockApiKeys]
    .filter((k) => k.status === 'active')
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map((key) => ({
      key,
      requests: Math.floor(key.usageCount * 0.1), // 24h requests
    }))

  return {
    totalKeys: mockApiKeys.length,
    activeKeys,
    expiredKeys,
    revokedKeys,
    byScope,
    totalRequests24h,
    topKeys,
  }
}

// =============================================================================
// Export Convenience Object
// =============================================================================

export const apiKeysApi = {
  getAll: getApiKeys,
  getById: getApiKeyById,
  create: createApiKey,
  update: updateApiKey,
  revoke: revokeApiKey,
  delete: deleteApiKey,
  getUsage: getApiKeyUsage,
  getUsageStats: getApiKeyUsageStats,
  getRateLimit: getApiKeyRateLimit,
  getLogs: getApiKeyLogs,
  validate: validateApiKey,
  getStats: getApiKeyStats,
}
