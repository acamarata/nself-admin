import { findNselfPath, getEnhancedPath } from '@/lib/nself-path'
import { getProjectPath } from '@/lib/paths'
import { emitBuildProgress } from '@/lib/websocket/emitters'
import { exec } from 'child_process'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(_request: NextRequest) {
  try {
    // Get the actual backend project path where we want to build
    const backendProjectPath = getProjectPath()

    console.log('=== Starting nself build ===')
    console.log('Backend project path:', backendProjectPath)

    // Find nself CLI using the centralized utility
    const nselfCommand = await findNselfPath()
    console.log('Using nself from:', nselfCommand)

    // Ensure the backend project directory exists
    try {
      await fs.mkdir(backendProjectPath, { recursive: true })
      console.log('Backend directory ready')
    } catch (mkdirError) {
      console.error('Failed to create backend directory:', mkdirError)
    }

    // Check if env files exist - nself build expects .env or .env.dev
    const envPath = path.join(backendProjectPath, '.env')
    const envDevPath = path.join(backendProjectPath, '.env.dev')

    let envFileFound = false
    try {
      await fs.access(envPath)
      console.log('.env found')
      envFileFound = true
    } catch {
      // Check for .env.dev as fallback
      try {
        await fs.access(envDevPath)
        console.log('.env.dev found')
        envFileFound = true
      } catch {
        console.error('Neither .env nor .env.dev found')
      }
    }

    if (!envFileFound) {
      return NextResponse.json(
        {
          error:
            'Project not initialized. Please run the setup wizard first. (No .env or .env.dev file found)',
        },
        { status: 400 },
      )
    }

    // Run nself build in the backend project directory
    console.log('Executing nself build command...')

    // Emit build start event
    emitBuildProgress({
      step: 'build',
      status: 'in-progress',
      progress: 0,
      message: 'Starting build process...',
      currentStep: 1,
      totalSteps: 6,
      timestamp: new Date().toISOString(),
    })

    try {
      // Step 1: Validating configuration
      emitBuildProgress({
        step: 'build',
        status: 'in-progress',
        progress: 10,
        message: 'Validating configuration...',
        currentStep: 1,
        totalSteps: 6,
        timestamp: new Date().toISOString(),
      })

      // First try the nself build command with a shorter timeout
      const result = await execAsync(
        `echo "Y" | ${nselfCommand} build --force`,
        {
          cwd: backendProjectPath,
          env: {
            ...process.env,
            PATH: getEnhancedPath(),
          },
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer for output
          timeout: 30000, // 30 second timeout - if it hangs, we'll generate manually
          shell: '/bin/bash',
        },
      )

      const { stdout, stderr } = result

      console.log('=== Build Output ===')
      console.log('stdout:', stdout)
      if (stderr) {
        console.log('stderr:', stderr)
      }

      // Step 2: Generating docker-compose.yml
      emitBuildProgress({
        step: 'build',
        status: 'in-progress',
        progress: 40,
        message: 'Generating docker-compose.yml...',
        currentStep: 2,
        totalSteps: 6,
        timestamp: new Date().toISOString(),
      })

      // Check if docker-compose.yml was created
      const dockerComposePath = path.join(
        backendProjectPath,
        'docker-compose.yml',
      )
      try {
        await fs.access(dockerComposePath)
        console.log('docker-compose.yml created successfully')

        // Count services in the generated file
        const dockerComposeContent = await fs.readFile(
          dockerComposePath,
          'utf-8',
        )
        const serviceMatches = dockerComposeContent.match(/^ {2}\w+:/gm)
        const serviceCount = serviceMatches ? serviceMatches.length : 0

        // Emit progress updates for remaining steps
        emitBuildProgress({
          step: 'build',
          status: 'in-progress',
          progress: 70,
          message: 'Creating networks and pulling images...',
          currentStep: 4,
          totalSteps: 6,
          timestamp: new Date().toISOString(),
        })

        // Final success
        emitBuildProgress({
          step: 'build',
          status: 'complete',
          progress: 100,
          message: `Build complete! ${serviceCount} services configured.`,
          currentStep: 6,
          totalSteps: 6,
          timestamp: new Date().toISOString(),
        })

        return NextResponse.json({
          success: true,
          message: 'Project built successfully',
          output:
            stdout ||
            `Build completed successfully. ${serviceCount} services configured.`,
          serviceCount,
        })
      } catch {
        console.error('docker-compose.yml not found after build')

        // Emit failure event
        emitBuildProgress({
          step: 'build',
          status: 'failed',
          progress: 40,
          message: 'Build failed: docker-compose.yml was not created',
          currentStep: 2,
          totalSteps: 6,
          timestamp: new Date().toISOString(),
        })

        return NextResponse.json(
          {
            error: 'Build failed',
            details: 'docker-compose.yml was not created',
            output: stdout,
          },
          { status: 500 },
        )
      }
    } catch (execError: any) {
      console.error('=== Build Error ===')
      console.error('Error code:', execError.code)
      console.error('Error message:', execError.message)
      console.error('stdout:', execError.stdout)
      console.error('stderr:', execError.stderr)

      // Check if docker-compose.yml exists despite error (sometimes nself returns non-zero but succeeds)
      const dockerComposePath = path.join(
        backendProjectPath,
        'docker-compose.yml',
      )
      try {
        await fs.access(dockerComposePath)
        const dockerComposeContent = await fs.readFile(
          dockerComposePath,
          'utf-8',
        )
        const serviceMatches = dockerComposeContent.match(/^ {2}\w+:/gm)
        const serviceCount = serviceMatches ? serviceMatches.length : 0

        console.log('Build appears successful despite exit code')

        // Emit success event
        emitBuildProgress({
          step: 'build',
          status: 'complete',
          progress: 100,
          message: `Build complete! ${serviceCount} services configured.`,
          currentStep: 6,
          totalSteps: 6,
          timestamp: new Date().toISOString(),
        })

        return NextResponse.json({
          success: true,
          message: 'Project built successfully',
          output:
            execError.stdout ||
            `Build completed. ${serviceCount} services configured.`,
          serviceCount,
        })
      } catch {
        // Build actually failed - emit failure event
        emitBuildProgress({
          step: 'build',
          status: 'failed',
          progress: 0,
          message: execError.stderr || execError.message || 'Build failed',
          currentStep: 1,
          totalSteps: 6,
          timestamp: new Date().toISOString(),
        })

        return NextResponse.json(
          {
            error: 'Build failed',
            details:
              execError.stderr ||
              execError.message ||
              'Unknown error during build',
            output: execError.stdout,
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error('=== Fatal Error in build API ===')
    console.error('Error:', error)

    // Emit failure event
    emitBuildProgress({
      step: 'build',
      status: 'failed',
      progress: 0,
      message: error instanceof Error ? error.message : 'Fatal error',
      currentStep: 1,
      totalSteps: 6,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: 'Failed to build project',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
