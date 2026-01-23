import { getEnhancedPath } from '@/lib/nself-path'
import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

// GET /api/deploy - Get deployment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const environment = searchParams.get('environment')
    const projectPath = getProjectPath()

    // Get deployment status
    const command = environment
      ? `nself deploy status --env=${environment}`
      : 'nself deploy status'

    try {
      const { stdout, stderr } = await execAsync(command, {
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
        status: 'not-deployed',
        output: execError.stdout || '',
        stderr: execError.stderr || '',
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get deployment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST /api/deploy - Execute deployment actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, environment, options = {} } = body
    const projectPath = getProjectPath()

    let command = ''

    switch (action) {
      case 'deploy':
        // nself deploy staging|prod [options]
        command = `nself deploy ${environment}`
        if (options.dryRun) command += ' --dry-run'
        if (options.force) command += ' --force'
        if (options.rolling) command += ' --rolling'
        if (options.skipHealth) command += ' --skip-health'
        if (options.includeFrontends) command += ' --include-frontends'
        if (options.excludeFrontends) command += ' --exclude-frontends'
        break

      case 'check-access':
        // nself deploy check-access
        command = 'nself deploy check-access'
        break

      case 'rollback':
        // nself deploy rollback
        command = `nself deploy rollback${environment ? ` ${environment}` : ''}`
        break

      case 'logs':
        // nself deploy logs
        command = `nself deploy logs${environment ? ` ${environment}` : ''}`
        break

      case 'health':
        // nself deploy health
        command = `nself deploy health${environment ? ` ${environment}` : ''}`
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: projectPath,
      env: { ...process.env, PATH: getEnhancedPath() },
      timeout: 300000, // 5 minute timeout for deployments
    })

    return NextResponse.json({
      success: true,
      action,
      environment,
      output: stdout.trim(),
      stderr: stderr.trim(),
    })
  } catch (error) {
    const execError = error as { message?: string; stdout?: string; stderr?: string }
    return NextResponse.json(
      {
        success: false,
        error: 'Deployment action failed',
        details: execError.message || 'Unknown error',
        stdout: execError.stdout || '',
        stderr: execError.stderr || '',
      },
      { status: 500 }
    )
  }
}
