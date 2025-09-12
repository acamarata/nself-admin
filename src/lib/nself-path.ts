import { exec } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Find the nself CLI executable
 * Priority order:
 * 1. nself in PATH (standard installation via curl|bash)
 * 2. Development location (/Users/admin/Sites/nself/bin/nself)
 * 3. Common installation paths
 */
export async function findNselfPath(): Promise<string> {
  // 1. Check if nself is in PATH (most common for users)
  try {
    await execAsync('which nself')
    console.log('Using nself from PATH')
    return 'nself'
  } catch {
    // Not in PATH, continue checking
  }

  // 2. Check development location (for developers)
  const devPath = '/Users/admin/Sites/nself/bin/nself'
  if (fs.existsSync(devPath)) {
    console.log('Using nself from development location:', devPath)
    return devPath
  }

  // 3. Check common installation paths
  const commonPaths = [
    '/usr/local/bin/nself',
    '/opt/homebrew/bin/nself',
    process.env.HOME + '/bin/nself',
    process.env.HOME + '/.local/bin/nself',
    '/usr/bin/nself',
  ]

  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      console.log('Found nself at:', path)
      return path
    }
  }

  // If not found, default to 'nself' and let it fail with a clear error
  console.warn('nself CLI not found in common locations, defaulting to PATH')
  return 'nself'
}

/**
 * Synchronous version for use in API routes
 */
export function findNselfPathSync(): string {
  // 1. Check if nself is in PATH
  try {
    require('child_process').execSync('which nself', { stdio: 'ignore' })
    return 'nself'
  } catch {
    // Not in PATH, continue checking
  }

  // 2. Check development location
  const devPath = '/Users/admin/Sites/nself/bin/nself'
  if (fs.existsSync(devPath)) {
    return devPath
  }

  // 3. Check common installation paths
  const commonPaths = [
    '/usr/local/bin/nself',
    '/opt/homebrew/bin/nself',
    process.env.HOME + '/bin/nself',
    process.env.HOME + '/.local/bin/nself',
    '/usr/bin/nself',
  ]

  for (const path of commonPaths) {
    if (fs.existsSync(path)) {
      return path
    }
  }

  // Default to 'nself' and let it fail with a clear error
  return 'nself'
}
