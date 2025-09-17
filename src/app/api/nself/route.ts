import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { command, args = [] } = await request.json()

    if (!command) {
      return NextResponse.json(
        { success: false, error: 'Command is required' },
        { status: 400 },
      )
    }

    // Validate allowed commands for security
    const allowedCommands = [
      'status',
      'doctor',
      'urls',
      'help',
      'version',
      'start',
      'stop',
      'restart',
      'logs',
      'ps',
      'build',
      'down',
      'up',
      'pull',
      'info',
      'init',
    ]

    if (!allowedCommands.includes(command)) {
      return NextResponse.json(
        { success: false, error: `Command '${command}' not allowed` },
        { status: 403 },
      )
    }

    // Execute nself command in the project directory using centralized resolution
    const projectPath = getProjectPath()
    const fullCommand = `nself ${command} ${args.join(' ')}`

    const { stdout, stderr } = await execAsync(fullCommand, {
      cwd: projectPath,
      env: {
        ...process.env,
        PATH: process.env.PATH + ':/usr/local/bin',
        // Ensure nself runs in the correct context
        NSELF_PROJECT_PATH: projectPath,
      },
      timeout: 30000, // 30 second timeout
    })

    return NextResponse.json({
      success: true,
      data: {
        command: `nself ${command} ${args.join(' ')}`,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute nself command',
        details: error?.message || 'Unknown error',
        stderr: error.stderr || '',
        stdout: error.stdout || '',
      },
      { status: 500 },
    )
  }
}

// GET endpoint for common status queries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'status'

  try {
    const projectPath = getProjectPath()

    let command = ''
    switch (action) {
      case 'status':
        command = 'nself status'
        break
      case 'urls':
        command = 'nself urls'
        break
      case 'doctor':
        command = 'nself doctor'
        break
      case 'version':
        command = 'nself version'
        break
      case 'help':
        command = 'nself help'
        break
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 },
        )
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: projectPath,
      env: {
        ...process.env,
        PATH: process.env.PATH + ':/usr/local/bin',
        NSELF_PROJECT_PATH: projectPath,
      },
      timeout: 30000,
    })

    return NextResponse.json({
      success: true,
      data: {
        action,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to get ${action} data`,
        details: error?.message || 'Unknown error',
      },
      { status: 500 },
    )
  }
}
