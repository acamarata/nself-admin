import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getProjectPath, getDockerSocketPath } from '@/lib/paths'

const execAsync = promisify(exec)

const ALLOWED_COMMANDS = [
  'nself init',
  'nself build', 
  'nself start',
  'nself stop',
  'nself status',
  'nself logs',
  'nself doctor',
  'nself urls',
  'nself help',
  'nself version'
]

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json()
    
    if (!command) {
      return NextResponse.json(
        { success: false, error: 'Command is required' },
        { status: 400 }
      )
    }
    
    // Security: Only allow specific nself commands
    const isAllowed = ALLOWED_COMMANDS.some(allowed => 
      command.trim().startsWith(allowed)
    )
    
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'Command not allowed' },
        { status: 403 }
      )
    }
    
    const backendPath = getProjectPath()
    
    try {
      const { stdout, stderr } = await execAsync(
        `cd ${backendPath} && ${command}`,
        {
          env: {
            ...process.env,
            PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin',
            FORCE_COLOR: '0', // Disable color output for cleaner logs
          },
          timeout: 300000 // 5 minute timeout for long operations
        }
      )
      
      return NextResponse.json({
        success: true,
        output: stdout || stderr || 'Command executed successfully',
        stdout,
        stderr
      })
    } catch (execError: any) {
      // Command failed but we still want to return the output
      return NextResponse.json({
        success: false,
        error: execError.message,
        output: execError.stdout || execError.stderr || execError.message,
        stdout: execError.stdout,
        stderr: execError.stderr
      })
    }
  } catch (error) {
    console.error('CLI execution error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute command',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}