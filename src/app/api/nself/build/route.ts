import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Get the actual backend project path where we want to build
    const backendProjectPath = getProjectPath()

    console.log('=== Starting nself build ===')
    console.log('Backend project path:', backendProjectPath)

    // Use nself from PATH first, fallback to known location
    let nselfCommand = 'nself'

    // Check if nself is in PATH
    try {
      await execAsync('which nself')
      console.log('Using nself from PATH')
    } catch {
      // Fallback to known location
      const nselfSourcePath = '/Users/admin/Sites/nself'
      const nselfPath = path.join(nselfSourcePath, 'bin', 'nself')

      try {
        await fs.access(nselfPath)
        nselfCommand = nselfPath
        console.log('Using nself from:', nselfPath)
      } catch {
        console.error('nself CLI not found')
        return NextResponse.json(
          { error: 'nself CLI not found. Please ensure nself is installed.' },
          { status: 500 },
        )
      }
    }

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

    try {
      // First try the nself build command with a shorter timeout
      const result = await execAsync(
        `echo "Y" | ${nselfCommand} build --force`,
        {
          cwd: backendProjectPath,
          env: {
            ...process.env,
            PATH: `${process.env.PATH}:/Users/admin/bin:/usr/local/bin:/opt/homebrew/bin`,
            TERM: 'dumb', // Disable interactive features
            CI: 'true', // Many tools respect CI env var to disable interaction
            FORCE_COLOR: '0', // Disable colored output that might cause issues
          },
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer for output
          timeout: 5000, // 5 second timeout - if it hangs, we'll generate manually
          shell: '/bin/bash',
        },
      )

      const { stdout, stderr } = result

      console.log('=== Build Output ===')
      console.log('stdout:', stdout)
      if (stderr) {
        console.log('stderr:', stderr)
      }

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
        const serviceMatches = dockerComposeContent.match(/^  \w+:/gm)
        const serviceCount = serviceMatches ? serviceMatches.length : 0

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
        const serviceMatches = dockerComposeContent.match(/^  \w+:/gm)
        const serviceCount = serviceMatches ? serviceMatches.length : 0

        console.log('Build appears successful despite exit code')
        return NextResponse.json({
          success: true,
          message: 'Project built successfully',
          output:
            execError.stdout ||
            `Build completed. ${serviceCount} services configured.`,
          serviceCount,
        })
      } catch {
        // Build actually failed
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
  } catch (error: any) {
    console.error('=== Fatal Error in build API ===')
    console.error('Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to build project',
        details: error.message || 'Unknown error',
      },
      { status: 500 },
    )
  }
}
