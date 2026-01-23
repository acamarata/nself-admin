import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import { findNselfPathSync, getEnhancedPath } from './nself-path'
import { getProjectPath } from './paths'

const execFileAsync = promisify(execFile)

// Get nself CLI path using centralized resolver
const getNselfCliPath = (): string => {
  return findNselfPathSync()
}

// Get the project working directory for nself commands
const getWorkingDirectory = (): string => {
  return getProjectPath()
}

export interface CLIResult {
  success: boolean
  stdout?: string
  stderr?: string
  exitCode?: number
  error?: string
}

/**
 * Execute nself CLI command
 */
export async function executeNselfCommand(
  command: string,
  args: string[] = [],
  options: Record<string, any> = {},
): Promise<CLIResult> {
  try {
    // Validate command
    const allowedCommands = [
      'init',
      'build',
      'start',
      'stop',
      'restart',
      'status',
      'logs',
      'doctor',
      'backup',
      'restore',
      'monitor',
      'config',
      'db',
      'deploy',
      'update',
      'version',
      'help',
      'urls',
      'apply',
      'secrets',
    ]

    if (!allowedCommands.includes(command)) {
      throw new Error(`Invalid nself command: ${command}`)
    }

    // Build arguments safely
    const cmdArgs = [
      command,
      ...args.filter((arg) => arg && typeof arg === 'string'),
    ]

    // Execute with timeout using execFile for safety
    const timeout = options.timeout || 60000 // Increased default timeout
    const cwd = options.cwd || getWorkingDirectory()
    const nselfPath = getNselfCliPath()
    const { stdout, stderr } = await execFileAsync(nselfPath, cmdArgs, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd, // Run in project directory
      env: { ...process.env, PATH: getEnhancedPath(), ...options.env },
    })

    return {
      success: true,
      stdout: stdout.toString(),
      stderr: stderr.toString(),
      exitCode: 0,
    }
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString(),
      exitCode: error.code,
      error: error.message,
    }
  }
}

/**
 * Stream output from long-running nself commands
 */
export function streamNselfCommand(
  command: string,
  args: string[] = [],
  onData: (chunk: string) => void,
  onError?: (error: string) => void,
  onClose?: (code: number) => void,
): () => void {
  // Validate command
  const allowedCommands = ['logs', 'monitor', 'watch', 'tail']

  if (!allowedCommands.includes(command)) {
    throw new Error(`Invalid streaming command: ${command}`)
  }

  const cwd = getWorkingDirectory()
  const nselfPath = getNselfCliPath()
  const child = spawn(nselfPath, [command, ...args], {
    cwd,
    env: { ...process.env, PATH: getEnhancedPath() },
  })

  child.stdout.on('data', (data) => {
    onData(data.toString())
  })

  child.stderr.on('data', (data) => {
    if (onError) {
      onError(data.toString())
    }
  })

  child.on('close', (code) => {
    if (onClose) {
      onClose(code || 0)
    }
  })

  // Return kill function
  return () => {
    child.kill()
  }
}

// Specific nself CLI commands

export async function nselfStatus(): Promise<CLIResult> {
  return executeNselfCommand('status')
}

export async function nselfStart(): Promise<CLIResult> {
  return executeNselfCommand('start')
}

export async function nselfStop(): Promise<CLIResult> {
  return executeNselfCommand('stop')
}

export async function nselfRestart(): Promise<CLIResult> {
  return executeNselfCommand('restart')
}

export async function nselfLogs(
  service?: string,
  lines?: number,
): Promise<CLIResult> {
  const args = []
  if (service) args.push(service)
  if (lines) args.push(`-n${lines}`)
  return executeNselfCommand('logs', args)
}

export async function nselfBackup(outputPath?: string): Promise<CLIResult> {
  const args = outputPath ? ['--output', outputPath] : []
  return executeNselfCommand('backup', args)
}

export async function nselfRestore(backupPath: string): Promise<CLIResult> {
  return executeNselfCommand('restore', [backupPath])
}

export async function nselfConfig(
  action: 'get' | 'set',
  key?: string,
  value?: string,
): Promise<CLIResult> {
  const args: string[] = [action]
  if (key) args.push(key)
  if (value) args.push(value)
  return executeNselfCommand('config', args)
}

export async function nselfDatabase(query: string): Promise<CLIResult> {
  return executeNselfCommand('db', ['query', query])
}

export async function nselfDeploy(
  target: string,
  options?: Record<string, any>,
): Promise<CLIResult> {
  const args = [target]
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      args.push(`--${key}`, String(value))
    })
  }
  return executeNselfCommand('deploy', args)
}

export async function nselfUpdate(): Promise<CLIResult> {
  return executeNselfCommand('update')
}

export async function nselfVersion(): Promise<CLIResult> {
  return executeNselfCommand('version')
}

export async function nselfHelp(command?: string): Promise<CLIResult> {
  const args = command ? [command] : []
  return executeNselfCommand('help', args)
}

// Additional missing commands

export async function nselfDoctor(fix: boolean = false): Promise<CLIResult> {
  const args = fix ? ['--fix'] : []
  return executeNselfCommand('doctor', args)
}

export async function nselfMonitor(
  action?: 'enable' | 'disable' | 'status',
): Promise<CLIResult> {
  const args = action ? [`--${action}`] : []
  return executeNselfCommand('monitor', args)
}

export async function nselfUrls(format?: 'json' | 'table'): Promise<CLIResult> {
  const args = format ? ['--format', format] : []
  return executeNselfCommand('urls', args)
}

export async function nselfApply(configPath?: string): Promise<CLIResult> {
  const args = configPath ? ['--config', configPath] : []
  return executeNselfCommand('apply', args)
}

export async function nselfSecrets(
  action: 'generate' | 'rotate',
  service?: string,
): Promise<CLIResult> {
  const args: string[] = [action]
  if (service) args.push(service)
  return executeNselfCommand('secrets', args)
}

export async function nselfExport(
  format: 'compose' | 'kubernetes',
  outputPath?: string,
): Promise<CLIResult> {
  const args = ['--format', format]
  if (outputPath) args.push('--output', outputPath)
  return executeNselfCommand('export', args)
}

export async function nselfScale(
  service: string,
  replicas: number,
): Promise<CLIResult> {
  return executeNselfCommand('scale', [service, String(replicas)])
}

export async function nselfHealthcheck(service?: string): Promise<CLIResult> {
  const args = service ? [service] : ['--all']
  return executeNselfCommand('healthcheck', args)
}
