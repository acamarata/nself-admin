/**
 * Database Management Types for nself-admin v0.0.8
 */

export interface DatabaseStatus {
  connected: boolean
  version: string
  size: string
  tables: number
  connections: {
    active: number
    idle: number
    max: number
  }
  uptime: string
  lastBackup?: string
}

export interface Backup {
  id: string
  name: string
  filename: string
  type: 'full' | 'data' | 'schema'
  size: string
  compressed: boolean
  environment: 'local' | 'staging' | 'production'
  createdAt: string
  path: string
}

export interface BackupSchedule {
  id: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  cronExpression?: string
  retentionDays: number
  type: 'full' | 'data'
  compress: boolean
  lastRun?: string
  nextRun?: string
}

export interface Migration {
  id: string
  name: string
  status: 'pending' | 'applied' | 'failed'
  appliedAt?: string
  batch: number
  sql?: string
  rollbackSql?: string
}

export interface Seed {
  name: string
  type: 'common' | 'local' | 'staging' | 'production'
  status: 'available' | 'applied' | 'failed'
  appliedAt?: string
  recordCount?: number
}

export interface TableInfo {
  name: string
  schema: string
  rowCount: number
  size: string
  totalSize: string
  lastVacuum?: string
  lastAnalyze?: string
  columns: ColumnInfo[]
  indexes: IndexInfo[]
  foreignKeys: ForeignKeyInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  comment?: string
}

export interface IndexInfo {
  name: string
  columns: string[]
  unique: boolean
  type: string
  size?: string
  scansCount?: number
}

export interface ForeignKeyInfo {
  name: string
  column: string
  referencesTable: string
  referencesColumn: string
  onDelete: string
  onUpdate: string
}

export interface QueryResult {
  rows: Record<string, unknown>[]
  rowCount: number
  fields: { name: string; type: string }[]
  duration: number
}

export interface SlowQuery {
  query: string
  calls: number
  totalTime: number
  meanTime: number
  maxTime: number
  rows: number
}

export interface DatabaseInspection {
  overview: {
    databaseSize: string
    tablesCount: number
    indexesCount: number
    connectionsActive: number
    connectionsIdle: number
  }
  tableSizes: { name: string; size: string; rowCount: number }[]
  cacheHitRatio: number
  indexUsage: { name: string; scans: number; size: string }[]
  bloat: { table: string; bloatRatio: number; wastedBytes: string }[]
  locks: { table: string; mode: string; granted: boolean; pid: number }[]
}

export interface TypeGenerationResult {
  language: 'typescript' | 'go' | 'python'
  content: string
  tables: string[]
  generatedAt: string
}

export interface MockDataConfig {
  seed: number
  tables: {
    [tableName: string]: {
      count: number
      excludeColumns?: string[]
    }
  }
  excludeTables?: string[]
}
