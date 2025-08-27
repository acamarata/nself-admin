import { z } from 'zod'

// Authentication schemas
export const loginSchema = z.object({
  password: z.string().min(1, 'Password is required').max(256, 'Password too long')
})

// Docker operation schemas
export const dockerActionSchema = z.object({
  action: z.enum(['start', 'stop', 'restart', 'remove', 'pause', 'unpause']),
  containerId: z.string().regex(/^[a-f0-9]{12,64}$/i, 'Invalid container ID')
})

export const dockerBulkActionSchema = z.object({
  action: z.enum(['start', 'stop', 'restart', 'remove']),
  containerIds: z.array(z.string().regex(/^[a-f0-9]{12,64}$/i))
})

// Database query schemas
export const databaseQuerySchema = z.object({
  query: z.string().min(1).max(10000),
  database: z.string().optional(),
  timeout: z.number().min(1000).max(60000).optional() // 1-60 seconds
})

// Configuration schemas
export const envUpdateSchema = z.object({
  key: z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'Invalid environment variable name'),
  value: z.string().max(10000),
  description: z.string().optional()
})

export const configFileSchema = z.object({
  filename: z.string().regex(/^[a-zA-Z0-9_\-\.]+$/, 'Invalid filename'),
  content: z.string().max(1000000), // 1MB max
  backup: z.boolean().optional()
})

// Service management schemas
export const serviceCommandSchema = z.object({
  service: z.string().regex(/^[a-z][a-z0-9_\-]*$/i),
  command: z.enum(['logs', 'inspect', 'stats', 'exec']),
  args: z.array(z.string()).optional()
})

// Project schemas
export const projectInitSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z][a-z0-9\-]*$/),
  template: z.enum(['basic', 'full', 'minimal', 'custom']).optional(),
  services: z.array(z.string()).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional()
})

// Backup/Restore schemas
export const backupSchema = z.object({
  includeDatabase: z.boolean().default(true),
  includeFiles: z.boolean().default(true),
  includeConfig: z.boolean().default(true),
  compression: z.enum(['gzip', 'bzip2', 'none']).default('gzip'),
  encryptionKey: z.string().optional()
})

export const restoreSchema = z.object({
  backupFile: z.string(),
  includeDatabase: z.boolean().default(true),
  includeFiles: z.boolean().default(true),
  includeConfig: z.boolean().default(true),
  decryptionKey: z.string().optional()
})

// CLI execution schemas
export const cliCommandSchema = z.object({
  command: z.string().regex(/^[a-z][a-z\-]*$/, 'Invalid command'),
  args: z.array(z.string()).max(20),
  options: z.record(z.string(), z.any()).optional(),
  timeout: z.number().min(1000).max(300000).optional() // 1-300 seconds
})

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizePath(path: string): string {
  // Remove any directory traversal attempts
  return path.replace(/\.\./g, '').replace(/\/\//g, '/')
}

export function sanitizeCommand(command: string): string {
  // Remove dangerous characters that could lead to command injection
  return command.replace(/[;&|`$()<>]/g, '')
}

// Validation middleware helper
export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const validated = await schema.parseAsync(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}