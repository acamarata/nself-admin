import { getEnhancedPath } from '@/lib/nself-path'
import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

// GET /api/deploy/staging - Get staging status
export async function GET() {
  try {
    const projectPath = getProjectPath()

    try {
      const { stdout, stderr } = await execAsync('nself staging status', {
        cwd: projectPath,
        env: { ...process.env, PATH: getEnhancedPath() },
        timeout: 30000,
      })

      return NextResponse.json({
        success: true,
        status: stdout.trim(),
        stderr: stderr.trim(),
      })
    } catch (error) {
      const execError = error as { stdout?: string; stderr?: string }
      return NextResponse.json({
        success: true,
        status: 'not-configured',
        output: execError.stdout || '',
        stderr: execError.stderr || '',
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get staging status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// POST /api/deploy/staging - Execute staging commands
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options = {} } = body
    const projectPath = getProjectPath()

    let command = ''

    switch (action) {
      case 'init':
        // nself staging init <domain> [--email <email>] [--server <host>]
        command = `nself staging init ${options.domain}`
        if (options.email) command += ` --email ${options.email}`
        if (options.server) command += ` --server ${options.server}`
        break

      case 'deploy':
        // nself staging deploy [--dry-run] [--force]
        command = 'nself staging deploy'
        if (options.dryRun) command += ' --dry-run'
        if (options.force) command += ' --force'
        break

      case 'reset':
        // nself staging reset [--data] [--force]
        command = 'nself staging reset'
        if (options.data) command += ' --data'
        if (options.force) command += ' --force'
        break

      case 'seed':
        // nself staging seed [file]
        command = 'nself staging seed'
        if (options.file) command += ` --file ${options.file}`
        break

      case 'sync':
        // nself staging sync [db|files] [--force]
        command = 'nself staging sync'
        if (options.type) command += ` ${options.type}`
        if (options.force) command += ' --force'
        break

      case 'logs':
        // nself staging logs [service] [-f] [-n <lines>]
        command = 'nself staging logs'
        if (options.service) command += ` ${options.service}`
        if (options.lines) command += ` -n ${options.lines}`
        // Note: -f (follow) not supported in API calls
        break

      case 'shell':
        // For shell/ssh, we return the command to run, not execute it
        return NextResponse.json({
          success: true,
          action: 'shell',
          command: `nself staging shell${options.service ? ` ${options.service}` : ''}`,
          message: 'Use this command in your terminal to connect',
        })

      case 'secrets':
        // nself staging secrets <action>
        command = `nself staging secrets ${options.secretAction || 'show'}`
        if (options.secretAction === 'generate' && options.force) {
          command += ' --force'
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 },
        )
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: projectPath,
      env: { ...process.env, PATH: getEnhancedPath() },
      timeout: 300000, // 5 minute timeout
    })

    return NextResponse.json({
      success: true,
      action,
      output: stdout.trim(),
      stderr: stderr.trim(),
    })
  } catch (error) {
    const execError = error as {
      message?: string
      stdout?: string
      stderr?: string
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Staging action failed',
        details: execError.message || 'Unknown error',
        stdout: execError.stdout || '',
        stderr: execError.stderr || '',
      },
      { status: 500 },
    )
  }
}
