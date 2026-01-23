import { getEnhancedPath } from '@/lib/nself-path'
import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface Environment {
  name: string
  type: 'local' | 'staging' | 'production' | 'custom'
  hasEnv: boolean
  hasSecrets: boolean
  hasServer: boolean
  serverConfig?: {
    host?: string
    port?: number
    user?: string
    deployPath?: string
  }
  isCurrent: boolean
}

// GET /api/env - List all environments
export async function GET() {
  try {
    const projectPath = getProjectPath()
    const environmentsDir = path.join(projectPath, '.environments')

    const environments: Environment[] = []

    // Check if .environments directory exists
    try {
      const envDirs = await fs.readdir(environmentsDir)

      for (const envName of envDirs) {
        const envPath = path.join(environmentsDir, envName)
        const stat = await fs.stat(envPath)

        if (!stat.isDirectory()) continue

        // Check for required files
        const hasEnv = await fs
          .access(path.join(envPath, '.env'))
          .then(() => true)
          .catch(() => false)

        const hasSecrets = await fs
          .access(path.join(envPath, '.env.secrets'))
          .then(() => true)
          .catch(() => false)

        const hasServer = await fs
          .access(path.join(envPath, 'server.json'))
          .then(() => true)
          .catch(() => false)

        // Read server config if exists
        let serverConfig
        if (hasServer) {
          try {
            const serverJson = await fs.readFile(
              path.join(envPath, 'server.json'),
              'utf-8',
            )
            serverConfig = JSON.parse(serverJson)
          } catch {
            // Invalid JSON, skip
          }
        }

        // Determine environment type
        let type: Environment['type'] = 'custom'
        if (envName === 'dev' || envName === 'local') type = 'local'
        else if (envName === 'staging') type = 'staging'
        else if (envName === 'prod' || envName === 'production')
          type = 'production'

        environments.push({
          name: envName,
          type,
          hasEnv,
          hasSecrets,
          hasServer,
          serverConfig: serverConfig
            ? {
                host: serverConfig.host,
                port: serverConfig.port,
                user: serverConfig.user,
                deployPath: serverConfig.deploy_path,
              }
            : undefined,
          isCurrent: false,
        })
      }
    } catch {
      // .environments directory doesn't exist
    }

    // Check current environment
    try {
      const currentEnvPath = path.join(projectPath, '.current-env')
      const currentEnv = await fs.readFile(currentEnvPath, 'utf-8')
      const current = currentEnv.trim()
      environments.forEach((env) => {
        if (env.name === current) {
          env.isCurrent = true
        }
      })
    } catch {
      // No current env file, default to 'dev'
      environments.forEach((env) => {
        if (env.name === 'dev') {
          env.isCurrent = true
        }
      })
    }

    // Also try nself env list command
    try {
      const { stdout } = await execAsync('nself env list', {
        cwd: projectPath,
        env: { ...process.env, PATH: getEnhancedPath() },
        timeout: 10000,
      })

      return NextResponse.json({
        success: true,
        environments,
        cliOutput: stdout.trim(),
        projectPath,
      })
    } catch {
      // CLI command failed, return what we found
      return NextResponse.json({
        success: true,
        environments,
        projectPath,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list environments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// POST /api/env - Execute environment commands
export async function POST(request: NextRequest) {
  try {
    const { action, name, template, force } = await request.json()
    const projectPath = getProjectPath()

    let command = ''
    switch (action) {
      case 'create':
        command = `nself env create ${name} ${template || 'local'}${force ? ' --force' : ''}`
        break
      case 'switch':
        command = `nself env switch ${name}`
        break
      case 'delete':
        command = `nself env delete ${name}${force ? ' --force' : ''}`
        break
      case 'validate':
        command = `nself env validate ${name || ''}`
        break
      case 'status':
        command = 'nself env status'
        break
      case 'info':
        command = `nself env info ${name || ''}`
        break
      case 'diff':
        const { env1, env2, values } = await request.json()
        command = `nself env diff ${env1} ${env2}${values ? ' --values' : ''}`
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
      timeout: 30000,
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
        error: 'Failed to execute environment command',
        details: execError.message || 'Unknown error',
        stdout: execError.stdout || '',
        stderr: execError.stderr || '',
      },
      { status: 500 },
    )
  }
}
