/**
 * Environment variable validation
 */

import { z } from 'zod'

const envSchema = z.object({
  // Required environment variables
  ADMIN_PASSWORD: z.string().min(8, 'Admin password must be at least 8 characters'),
  
  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.string().regex(/^\d+$/, 'Port must be a number').default('3021'),
  PROJECT_PATH: z.string().default('/project'),
  AUTO_UPDATE: z.enum(['true', 'false']).default('true'),
  UPDATE_CHECK_INTERVAL: z.string().regex(/^\d+$/).default('6'),
  TZ: z.string().default('UTC'),
  
  // Optional
  ADMIN_PASSWORD_IS_HASHED: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  BASE_DOMAIN: z.string().optional(),
  ADMIN_VERSION: z.string().optional(),
})

export type EnvConfig = z.infer<typeof envSchema>

/**
 * Validate environment variables
 */
export function validateEnv(): EnvConfig {
  try {
    const env = envSchema.parse(process.env)
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ')
      console.error('❌ Invalid environment variables:', missingVars)
      console.error('Details:', error.errors)
      
      // In production, exit the process
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
    throw error
  }
}

/**
 * Check runtime environment
 */
export function checkRuntimeEnvironment() {
  const checks = {
    dockerSocket: false,
    projectDir: false,
    writePermissions: false,
    nselfCli: false,
  }
  
  // Check Docker socket
  try {
    const fs = require('fs')
    fs.accessSync('/var/run/docker.sock', fs.constants.R_OK)
    checks.dockerSocket = true
  } catch {
    console.warn('⚠️ Docker socket not accessible')
  }
  
  // Check project directory
  try {
    const fs = require('fs')
    const projectPath = process.env.PROJECT_PATH || '/project'
    fs.accessSync(projectPath, fs.constants.R_OK | fs.constants.W_OK)
    checks.projectDir = true
  } catch {
    console.warn('⚠️ Project directory not accessible')
  }
  
  // Check write permissions for data directory
  try {
    const fs = require('fs')
    fs.accessSync('/data', fs.constants.W_OK)
    checks.writePermissions = true
  } catch {
    console.warn('⚠️ Data directory not writable')
  }
  
  // Check nself CLI availability
  try {
    const { execSync } = require('child_process')
    execSync('which nself', { stdio: 'ignore' })
    checks.nselfCli = true
  } catch {
    console.warn('⚠️ nself CLI not found in PATH')
  }
  
  return checks
}

/**
 * Initialize environment validation
 */
export function initializeEnvironment() {
  console.log('🔍 Validating environment variables...')
  const config = validateEnv()
  
  console.log('🔍 Checking runtime environment...')
  const runtime = checkRuntimeEnvironment()
  
  console.log('✅ Environment validation complete')
  console.log('Configuration:', {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    projectPath: config.PROJECT_PATH,
    autoUpdate: config.AUTO_UPDATE === 'true',
    timezone: config.TZ,
  })
  
  console.log('Runtime checks:', runtime)
  
  return { config, runtime }
}