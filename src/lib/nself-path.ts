import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Get the nself CLI development path from environment or derive from HOME
 * Supports NSELF_CLI_PATH env var for explicit override
 */
function getDevPath(): string {
  // Allow explicit override via environment variable
  if (process.env.NSELF_CLI_PATH) {
    return process.env.NSELF_CLI_PATH
  }

  // Derive from HOME directory for development setups
  const home = process.env.HOME || '/root'
  return path.join(home, 'Sites', 'nself', 'bin', 'nself')
}

/**
 * Get common installation paths for nself CLI
 */
function getCommonPaths(): string[] {
  const home = process.env.HOME || '/root'
  return [
    '/usr/local/bin/nself',
    '/opt/homebrew/bin/nself',
    path.join(home, 'bin', 'nself'),
    path.join(home, '.local', 'bin', 'nself'),
    path.join(home, '.nself', 'bin', 'nself'),
    '/usr/bin/nself',
  ]
}

/**
 * Find the nself CLI executable
 * Priority order:
 * 1. NSELF_CLI_PATH environment variable (explicit override)
 * 2. nself in PATH (standard installation via curl|bash)
 * 3. Development location ($HOME/Sites/nself/bin/nself)
 * 4. Common installation paths
 */
export async function findNselfPath(): Promise<string> {
  // 1. Check explicit environment variable first
  if (process.env.NSELF_CLI_PATH && fs.existsSync(process.env.NSELF_CLI_PATH)) {
    return process.env.NSELF_CLI_PATH
  }

  // 2. Check if nself is in PATH (most common for users)
  try {
    await execAsync('which nself')
    return 'nself'
  } catch {
    // Not in PATH, continue checking
  }

  // 3. Check development location (for developers)
  const devPath = getDevPath()
  if (fs.existsSync(devPath)) {
    return devPath
  }

  // 4. Check common installation paths
  const commonPaths = getCommonPaths()
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p
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
  // 1. Check explicit environment variable first
  if (process.env.NSELF_CLI_PATH && fs.existsSync(process.env.NSELF_CLI_PATH)) {
    return process.env.NSELF_CLI_PATH
  }

  // 2. Check if nself is in PATH
  try {
    require('child_process').execSync('which nself', { stdio: 'ignore' })
    return 'nself'
  } catch {
    // Not in PATH, continue checking
  }

  // 3. Check development location
  const devPath = getDevPath()
  if (fs.existsSync(devPath)) {
    return devPath
  }

  // 4. Check common installation paths
  const commonPaths = getCommonPaths()
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p
    }
  }

  // Default to 'nself' and let it fail with a clear error
  return 'nself'
}

/**
 * Get the PATH environment with common binary locations included
 * This ensures nself and other tools can be found during command execution
 */
export function getEnhancedPath(): string {
  const home = process.env.HOME || '/root'
  const additionalPaths = [
    '/opt/homebrew/bin',
    '/opt/homebrew/opt/coreutils/libexec/gnubin',
    '/usr/local/bin',
    path.join(home, 'bin'),
    path.join(home, '.local', 'bin'),
    path.join(home, '.nself', 'bin'),
  ]
  const currentPath = process.env.PATH || '/usr/bin:/bin'
  return [...additionalPaths, currentPath].join(':')
}
