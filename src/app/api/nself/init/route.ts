import { findNselfPath, getEnhancedPath } from '@/lib/nself-path'
import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { projectName = 'my_project' } = await request.json()
    const projectPath = getProjectPath()

    console.log('=== nself init API ===')
    console.log('Project path:', projectPath)
    console.log('Project name:', projectName)

    // Find nself CLI
    const nselfPath = await findNselfPath()

    // Run nself init --full (no arguments needed)
    console.log('Running nself init --full...')

    try {
      const { stdout, stderr } = await execAsync(`${nselfPath} init --full`, {
        cwd: projectPath,
        env: {
          ...process.env,
          PATH: getEnhancedPath(),
        },
        timeout: 10000, // 10 seconds
      })

      console.log('Init output:', stdout)
      if (stderr && !stderr.includes('warning')) {
        console.error('Init stderr:', stderr)
      }

      return NextResponse.json({
        success: true,
        message: 'Project initialized successfully',
        output: stdout,
      })
    } catch (execError: any) {
      // nself init might already have files, which is ok
      console.log('Init command output:', execError.message)

      // Check if it's just because files already exist
      if (
        execError.message.includes('already exists') ||
        execError.message.includes('.env')
      ) {
        return NextResponse.json({
          success: true,
          message: 'Project already initialized',
          output: execError.stdout || '',
        })
      }

      throw execError
    }
  } catch (error) {
    console.error('Error initializing project:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize project',
        details:
          error instanceof Error
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
