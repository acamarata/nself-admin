import Loki from 'lokijs'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

// Database configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const DB_NAME = 'nadmin.db'
const DB_PATH = isDevelopment 
  ? path.join(process.cwd(), 'data', DB_NAME)  // Local dev path
  : '/app/data/nadmin.db'                       // Container path

// Ensure data directory exists (only at runtime, not build time)
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch (error) {
      console.warn('Could not create data directory:', error)
    }
  }
}

// Initialize database
let db: Loki | null = null
let isInitialized = false

// Collection references
let configCollection: Collection<ConfigItem> | null = null
let sessionsCollection: Collection<SessionItem> | null = null
let projectCacheCollection: Collection<ProjectCacheItem> | null = null
let auditLogCollection: Collection<AuditLogItem> | null = null

// Type definitions
export interface ConfigItem {
  key: string
  value: any
  updatedAt?: Date
}

export interface SessionItem {
  token: string
  userId: string
  createdAt: Date
  expiresAt: Date
  lastActivity?: Date
  ip?: string
  userAgent?: string
}

export interface ProjectCacheItem {
  key: string
  value: any
  cachedAt: Date
}

export interface AuditLogItem {
  action: string
  details?: any
  timestamp: Date
  success: boolean
  userId?: string
}

// Initialize database
export async function initDatabase(): Promise<void> {
  // Check if db exists and collections are initialized
  if (isInitialized && db && configCollection) return
  
  // Reset initialization flag if db is null
  if (!db) {
    isInitialized = false
  }

  // Ensure directory exists before initializing database
  ensureDataDir()

  return new Promise((resolve, reject) => {
    db = new Loki(DB_PATH, {
      autoload: true,
      autosave: true,
      autosaveInterval: 4000, // Save every 4 seconds
      persistenceMethod: 'fs',
      autoloadCallback: () => {
        try {
          // Initialize collections
          configCollection = db!.getCollection('config') || db!.addCollection('config', {
            unique: ['key'],
            indices: ['key']
          })

          sessionsCollection = db!.getCollection('sessions') || db!.addCollection('sessions', {
            unique: ['token'],
            indices: ['token', 'userId'],
            ttl: 24 * 60 * 60 * 1000, // 24 hours TTL
            ttlInterval: 60000 // Check every minute
          })

          projectCacheCollection = db!.getCollection('projectCache') || db!.addCollection('projectCache', {
            unique: ['key'],
            indices: ['key']
          })

          auditLogCollection = db!.getCollection('auditLog') || db!.addCollection('auditLog', {
            indices: ['action', 'timestamp'],
            ttl: 30 * 24 * 60 * 60 * 1000, // 30 days TTL
            ttlInterval: 60 * 60 * 1000 // Check every hour
          })

          isInitialized = true
          console.log('Database initialized at:', DB_PATH)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
    })
  })
}

// Config operations
export async function getConfig(key: string): Promise<any> {
  await initDatabase()
  const item = configCollection?.findOne({ key })
  return item?.value
}

export async function setConfig(key: string, value: any): Promise<void> {
  await initDatabase()
  const existing = configCollection?.findOne({ key })
  
  if (existing) {
    existing.value = value
    existing.updatedAt = new Date()
    configCollection?.update(existing)
  } else {
    configCollection?.insert({
      key,
      value,
      updatedAt: new Date()
    })
  }
  
  // Force save to disk
  db?.saveDatabase()
}

export async function deleteConfig(key: string): Promise<void> {
  await initDatabase()
  const item = configCollection?.findOne({ key })
  if (item) {
    configCollection?.remove(item)
  }
}

// Password operations
export async function hasAdminPassword(): Promise<boolean> {
  const passwordHash = await getConfig('admin_password_hash')
  return !!passwordHash
}

export async function getAdminPasswordHash(): Promise<string | null> {
  return await getConfig('admin_password_hash')
}

export async function setAdminPassword(passwordHash: string): Promise<void> {
  await setConfig('admin_password_hash', passwordHash)
  await addAuditLog('password_set', { method: 'initial_setup' }, true)
}

// Session configuration - can be customized
const SESSION_DURATION_HOURS = 7 * 24 // 7 days by default
const SESSION_EXTEND_ON_ACTIVITY = true // Extend session on each request

// Session operations
export async function createSession(userId: string, ip?: string, userAgent?: string): Promise<string> {
  await initDatabase()
  
  // Get custom session duration if configured
  const customDuration = await getConfig('SESSION_DURATION_HOURS')
  const durationHours = customDuration || SESSION_DURATION_HOURS
  
  const token = crypto.randomBytes(32).toString('hex')
  const session: SessionItem = {
    token,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000), // Configurable duration (default 7 days)
    ip,
    userAgent
  }
  
  sessionsCollection?.insert(session)
  await addAuditLog('session_created', { userId, ip }, true)
  
  return token
}

export async function getSession(token: string): Promise<SessionItem | null> {
  await initDatabase()
  const session = sessionsCollection?.findOne({ token })
  
  if (!session) return null
  
  // Check if expired
  if (new Date() > new Date(session.expiresAt)) {
    sessionsCollection?.remove(session)
    return null
  }
  
  // Extend session on activity if enabled
  if (SESSION_EXTEND_ON_ACTIVITY) {
    const now = new Date()
    const timeSinceLastActivity = session.lastActivity ? 
      (now.getTime() - new Date(session.lastActivity).getTime()) / (1000 * 60 * 60) : // hours
      24
    
    // Only extend if it's been more than 1 hour since last activity
    if (timeSinceLastActivity > 1) {
      const customDuration = await getConfig('SESSION_DURATION_HOURS')
      const durationHours = customDuration || SESSION_DURATION_HOURS
      
      session.expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)
      session.lastActivity = now
      sessionsCollection?.update(session)
    }
  }
  
  return session
}

export async function deleteSession(token: string): Promise<void> {
  await initDatabase()
  const session = sessionsCollection?.findOne({ token })
  if (session) {
    sessionsCollection?.remove(session)
    await addAuditLog('session_deleted', { userId: session.userId }, true)
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  await initDatabase()
  const now = new Date()
  const expired = sessionsCollection?.find({
    expiresAt: { $lt: now }
  }) || []
  
  expired.forEach(session => {
    sessionsCollection?.remove(session)
  })
  
  return expired.length
}

// Project cache operations
export async function getCachedProjectInfo(key: string): Promise<any> {
  await initDatabase()
  const item = projectCacheCollection?.findOne({ key })
  
  // Check if cache is older than 5 minutes
  if (item && new Date().getTime() - new Date(item.cachedAt).getTime() > 5 * 60 * 1000) {
    projectCacheCollection?.remove(item)
    return null
  }
  
  return item?.value
}

export async function setCachedProjectInfo(key: string, value: any): Promise<void> {
  await initDatabase()
  const existing = projectCacheCollection?.findOne({ key })
  
  if (existing) {
    existing.value = value
    existing.cachedAt = new Date()
    projectCacheCollection?.update(existing)
  } else {
    projectCacheCollection?.insert({
      key,
      value,
      cachedAt: new Date()
    })
  }
}

// Audit log operations
export async function addAuditLog(
  action: string, 
  details: any = {}, 
  success: boolean = true,
  userId?: string
): Promise<void> {
  await initDatabase()
  
  auditLogCollection?.insert({
    action,
    details,
    timestamp: new Date(),
    success,
    userId
  })
}

export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0,
  filter?: { action?: string; userId?: string }
): Promise<AuditLogItem[]> {
  await initDatabase()
  
  let query: any = {}
  if (filter?.action) query.action = filter.action
  if (filter?.userId) query.userId = filter.userId
  
  const logs = auditLogCollection?.chain()
    .find(query)
    .simplesort('timestamp', true) // Sort by timestamp descending
    .offset(offset)
    .limit(limit)
    .data() || []
  
  return logs
}

// Development helpers
export async function isDevelopmentMode(): Promise<boolean> {
  const devMode = await getConfig('development_mode')
  return devMode !== false // Default to true if not set
}

export async function getProjectPath(): Promise<string> {
  // In development, use sibling directory
  if (isDevelopment) {
    return path.join(process.cwd(), '..', 'nself')
  }
  
  // In production, use mounted volume or environment variable
  return process.env.NSELF_PROJECT_PATH || '/workspace'
}

// Export the database instance for advanced operations
export function getDatabase(): Loki | null {
  return db
}

// Initialize on module load
if (typeof window === 'undefined') {
  // Only initialize on server side
  initDatabase().catch(console.error)
}