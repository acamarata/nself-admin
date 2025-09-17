/**
 * nself CLI integration
 * Executes nself commands from the admin UI
 */

import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { getProjectPath } from './paths'

const execAsync = promisify(exec)

// Check if nself CLI is available
export async function checkNselfCLI(): Promise<boolean> {
  try {
    await execAsync('which nself')
    return true
  } catch {
    // Try common installation paths
    const paths = [
      '/usr/local/bin/nself',
      '/usr/bin/nself',
      '~/.nself/bin/nself',
      '/opt/nself/bin/nself',
    ]

    for (const path of paths) {
      try {
        await execAsync(`test -f ${path}`)
        return true
      } catch {
        continue
      }
    }
    return false
  }
}

// Get nself CLI path
export async function getNselfPath(): Promise<string> {
  try {
    const { stdout } = await execAsync('which nself')
    return stdout.trim()
  } catch {
    // Try common paths
    const paths = [
      '/usr/local/bin/nself',
      '/usr/bin/nself',
      `${process.env.HOME}/.nself/bin/nself`,
      '/opt/nself/bin/nself',
    ]

    for (const path of paths) {
      try {
        await execAsync(`test -x ${path}`)
        return path
      } catch {
        continue
      }
    }
    throw new Error('nself CLI not found')
  }
}

// Execute nself command
export async function executeNselfCommand(
  command: string,
  args: string[] = [],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<{ stdout: string; stderr: string; code: number }> {
  const nselfPath = await getNselfPath()
  const cwd = options.cwd || getProjectPath()

  return new Promise((resolve, reject) => {
    const fullCommand = `${nselfPath} ${command} ${args.join(' ')}`

    exec(
      fullCommand,
      {
        cwd,
        env: { ...process.env, ...options.env },
      },
      (error, stdout, stderr) => {
        if (error && error.code !== 0) {
          // Some commands return non-zero on expected conditions
          resolve({
            stdout: stdout || '',
            stderr: stderr || error.message,
            code: error.code || 1,
          })
        } else {
          resolve({
            stdout: stdout || '',
            stderr: stderr || '',
            code: 0,
          })
        }
      },
    )
  })
}

// Stream nself command output
export function streamNselfCommand(
  command: string,
  args: string[] = [],
  onData: (data: string, type: 'stdout' | 'stderr') => void,
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<{ code: number }> {
  return new Promise(async (resolve, reject) => {
    try {
      const nselfPath = await getNselfPath()
      const cwd = options.cwd || getProjectPath()

      const child = spawn(nselfPath, [command, ...args], {
        cwd,
        env: { ...process.env, ...options.env },
      })

      child.stdout.on('data', (data) => {
        onData(data.toString(), 'stdout')
      })

      child.stderr.on('data', (data) => {
        onData(data.toString(), 'stderr')
      })

      child.on('close', (code) => {
        resolve({ code: code || 0 })
      })

      child.on('error', (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Common nself commands
export const nselfCommands = {
  // Project management
  init: (args: string[] = []) => executeNselfCommand('init', args),
  build: (args: string[] = []) => executeNselfCommand('build', args),
  start: (args: string[] = []) => executeNselfCommand('start', args),
  stop: (args: string[] = []) => executeNselfCommand('stop', args),
  restart: (args: string[] = []) => executeNselfCommand('restart', args),
  reset: (args: string[] = []) => executeNselfCommand('reset', args),

  // Status and monitoring
  status: (args: string[] = []) => executeNselfCommand('status', args),
  logs: (service?: string) =>
    executeNselfCommand('logs', service ? [service] : []),
  doctor: () => executeNselfCommand('doctor'),

  // Database
  db: (subcommand: string, args: string[] = []) =>
    executeNselfCommand('db', [subcommand, ...args]),

  // Backup
  backup: (args: string[] = []) => executeNselfCommand('backup', args),

  // Configuration
  email: (args: string[] = []) => executeNselfCommand('email', args),
  ssl: (args: string[] = []) => executeNselfCommand('ssl', args),

  // Deployment
  deploy: (args: string[] = []) => executeNselfCommand('deploy', args),

  // Version
  version: () => executeNselfCommand('version'),
  update: () => executeNselfCommand('update'),
}

// Get project info from nself
export async function getNselfProjectInfo() {
  try {
    const { stdout } = await nselfCommands.status(['--json'])
    return JSON.parse(stdout)
  } catch {
    // Fallback to basic status
    const { stdout } = await nselfCommands.status()
    return { raw: stdout }
  }
}

// Check if nself project exists
export async function isNselfProject(path: string = '.'): Promise<boolean> {
  try {
    await execAsync(`test -f ${path}/.env.local`)
    return true
  } catch {
    return false
  }
}
