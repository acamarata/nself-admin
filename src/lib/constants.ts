/**
 * Centralized constants for nself-admin
 * All port numbers, versions, and configuration values should be defined here
 */

// Version - imported from package.json at build time or from env
export const VERSION = process.env.ADMIN_VERSION || '0.0.6'

// Default ports for all services
export const PORTS = {
  // nself-admin
  ADMIN: 3021,

  // Core services
  POSTGRES: 5432,
  HASURA: 8080,
  AUTH: 4000,
  NGINX_HTTP: 80,
  NGINX_HTTPS: 443,

  // Storage
  MINIO_API: 9000,
  MINIO_CONSOLE: 9001,
  STORAGE: 5001,

  // Cache & Search
  REDIS: 6379,
  MEILISEARCH: 7700,

  // Email
  MAILPIT_SMTP: 1025,
  MAILPIT_UI: 8025,

  // Monitoring stack
  LOKI: 3100,
  GRAFANA: 3000,
  PROMETHEUS: 9090,
  TEMPO: 3200,
  ALERTMANAGER: 9093,
  NODE_EXPORTER: 9100,
  POSTGRES_EXPORTER: 9187,
  CADVISOR: 8080,
  JAEGER: 16686,

  // Functions
  FUNCTIONS: 3000,

  // ML
  MLFLOW: 5001,
} as const

// Port ranges for custom services
export const PORT_RANGES = {
  USER_APPS: { start: 3000, end: 3099 },
  SYSTEM_SERVICES: { start: 3100, end: 3199 },
  NESTJS: { start: 3100, end: 3199 },
} as const

// SSL modes supported by nself
export const SSL_MODES = {
  NONE: 'none',
  LOCAL: 'local',
  LETSENCRYPT: 'letsencrypt',
} as const

export type SSLMode = (typeof SSL_MODES)[keyof typeof SSL_MODES]

// Session configuration
export const SESSION = {
  DURATION_DAYS: 7,
  COOKIE_NAME: 'nself-session',
  CSRF_COOKIE_NAME: 'nself-csrf',
} as const

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  PROJECT_INFO: 5 * 60 * 1000, // 5 minutes
  DOCKER_STATUS: 10 * 1000, // 10 seconds
  METRICS: 5 * 1000, // 5 seconds
} as const

// API timeouts (in milliseconds)
export const TIMEOUTS = {
  CLI_COMMAND: 30 * 1000, // 30 seconds
  DOCKER_STATUS: 10 * 1000, // 10 seconds
  API_REQUEST: 5 * 1000, // 5 seconds
  BUILD: 5 * 60 * 1000, // 5 minutes
  START: 5 * 60 * 1000, // 5 minutes
} as const

// Password validation
export const PASSWORD = {
  MIN_LENGTH_DEV: 3,
  MIN_LENGTH_PROD: 12,
  SALT_ROUNDS: 12,
} as const

// Audit log retention (in days)
export const RETENTION = {
  AUDIT_LOG_DAYS: 30,
  SESSION_DAYS: 7,
} as const
