import { nselfInit } from '@/lib/nselfCLI'
import { getProjectPath } from '@/lib/paths'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { projectName = 'my_project' } = await request.json()
    const projectPath = getProjectPath()

    console.log('=== nself init API ===')
    console.log('Project path:', projectPath)
    console.log('Project name:', projectName)

    // Run nself init --full using secure CLI wrapper
    console.log('Running nself init --full...')

    const result = await nselfInit({ full: true })

    if (!result.success) {
      // Check if it's just because files already exist
      const errorMsg = result.error || result.stderr || ''
      if (errorMsg.includes('already exists') || errorMsg.includes('.env')) {
        return NextResponse.json({
          success: true,
          message: 'Project already initialized',
          output: result.stdout || '',
        })
      }

      return NextResponse.json(
        {
          error: 'Failed to initialize project',
          details: errorMsg || 'Unknown error',
          output: result.stdout,
        },
        { status: 500 },
      )
    }

    console.log('Init output:', result.stdout)
    if (result.stderr && !result.stderr.includes('warning')) {
      console.error('Init stderr:', result.stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Project initialized successfully',
      output: result.stdout || '',
    })
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
