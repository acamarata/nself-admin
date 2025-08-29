import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

export function isDevelopment(hostname?: string): boolean {
  const host = hostname || process.env.HOSTNAME || 'localhost'
  
  // Development patterns
  const devPatterns = [
    /^localhost(:\d+)?$/,
    /^127\.0\.0\.1(:\d+)?$/,
    /^0\.0\.0\.0(:\d+)?$/,
    /\.localhost$/,
    /\.local$/,
    /\.local\.nself\.org$/,
    /^admin\.localhost$/,
  ]
  
  return devPatterns.some(pattern => pattern.test(host))
}

export function loadEnvironmentVariables() {
  const rootDir = process.cwd()
  const isDevEnv = isDevelopment()
  
  // Define environment files in reverse priority order (last one wins)
  const envFiles = [
    isDevEnv ? '.env.dev' : '.env.prod',
    '.env.local',
    '.env'
  ].filter(Boolean)
  
  // Store all env vars from files
  const envVars: Record<string, string> = {}
  
  // Load each file in order (earlier files get overridden by later ones)
  for (const file of envFiles) {
    const filePath = path.join(rootDir, file)
    if (fs.existsSync(filePath)) {
      const result = dotenv.config({ path: filePath })
      if (result.parsed) {
        Object.assign(envVars, result.parsed)
      }
    }
  }
  
  // Apply the final set of environment variables
  Object.assign(process.env, envVars)
  
  return {
    isDevEnv,
    loadedFiles: envFiles.filter(file => 
      fs.existsSync(path.join(rootDir, file))
    ).reverse(), // Show in priority order
    adminPassword: process.env.ADMIN_PASSWORD,
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH
  }
}

export function hasAdminPassword(): boolean {
  const { adminPassword, adminPasswordHash } = loadEnvironmentVariables()
  return !!(adminPassword || adminPasswordHash)
}

export async function setAdminPassword(password: string, hostname?: string): Promise<void> {
  const isDevEnv = isDevelopment(hostname)
  const rootDir = process.cwd()
  const envFile = path.join(rootDir, '.env')
  
  // Read existing .env file or create new content
  let envContent = ''
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf-8')
  }
  
  // Remove existing password entries
  const lines = envContent.split('\n').filter(line => 
    !line.startsWith('ADMIN_PASSWORD=') && 
    !line.startsWith('ADMIN_PASSWORD_HASH=')
  )
  
  // Add new password entry
  if (isDevEnv) {
    // Development: store plain text
    lines.push(`ADMIN_PASSWORD=${password}`)
  } else {
    // Production: store hashed password
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash(password, 10)
    lines.push(`ADMIN_PASSWORD_HASH=${hash}`)
  }
  
  // Write back to file
  fs.writeFileSync(envFile, lines.join('\n'))
}

export async function verifyAdminPassword(password: string, hostname?: string): Promise<boolean> {
  const { adminPassword, adminPasswordHash } = loadEnvironmentVariables()
  const isDevEnv = isDevelopment(hostname)
  
  if (isDevEnv && adminPassword) {
    // Development: plain text comparison
    return password === adminPassword
  } else if (adminPasswordHash) {
    // Production: bcrypt comparison
    const bcrypt = await import('bcryptjs')
    return bcrypt.compare(password, adminPasswordHash)
  }
  
  return false
}