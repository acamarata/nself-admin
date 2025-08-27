import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { sanitizeCommand } from './validation'

const execAsync = promisify(exec)

// Path to nself CLI
const NSELF_CLI_PATH = process.env.NSELF_CLI_PATH || '/usr/local/bin/nself'

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
  options: Record<string, any> = {}
): Promise<CLIResult> {
  try {
    // Sanitize inputs
    const sanitizedCommand = sanitizeCommand(command)
    const sanitizedArgs = args.map(arg => sanitizeCommand(arg))
    
    // Build command string
    const fullCommand = `${NSELF_CLI_PATH} ${sanitizedCommand} ${sanitizedArgs.join(' ')}`
    
    // Execute with timeout
    const timeout = options.timeout || 30000
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      env: { ...process.env, ...options.env }
    })
    
    return {
      success: true,
      stdout: stdout.toString(),
      stderr: stderr.toString(),
      exitCode: 0
    }
  } catch (error: any) {
    return {
      success: false,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString(),
      exitCode: error.code,
      error: error.message
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
  onClose?: (code: number) => void
): () => void {
  const sanitizedCommand = sanitizeCommand(command)
  const sanitizedArgs = args.map(arg => sanitizeCommand(arg))
  
  const child = spawn(NSELF_CLI_PATH, [sanitizedCommand, ...sanitizedArgs])
  
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

export async function nselfLogs(service?: string, lines?: number): Promise<CLIResult> {
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

export async function nselfConfig(action: 'get' | 'set', key?: string, value?: string): Promise<CLIResult> {
  const args = [action]
  if (key) args.push(key)
  if (value) args.push(value)
  return executeNselfCommand('config', args)
}

export async function nselfDatabase(query: string): Promise<CLIResult> {
  return executeNselfCommand('db', ['query', query])
}

export async function nselfDeploy(target: string, options?: Record<string, any>): Promise<CLIResult> {
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