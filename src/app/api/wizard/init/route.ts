import {
  envFileExists,
  envToWizardConfig,
  readEnvFile,
} from '@/lib/env-handler'
import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const projectPath = getProjectPath()

    // Check if .env.local already exists
    const hasEnv = await envFileExists()

    if (hasEnv) {
      // Read existing env file and return config
      const env = await readEnvFile()
      if (env) {
        const wizardConfig = envToWizardConfig(env)
        // Merge the wizard config with raw env values so validation can check for existing keys
        const config = { ...wizardConfig, ...env }
        return NextResponse.json({
          success: true,
          hasEnvFile: true,
          config,
          message: 'Loaded existing configuration from .env.local',
        })
      }
    }

    // No env file exists, run nself init --full to create one
    console.log('No .env.local found, running nself init --full...')

    // Path to nself CLI
    const nselfPath = '/Users/admin/Sites/nself/bin/nself'

    // Run nself init --full to create all env files
    const { stdout, stderr } = await execAsync(`${nselfPath} init --full`, {
      cwd: projectPath,
      env: {
        ...process.env,
        PATH: `/opt/homebrew/opt/coreutils/libexec/gnubin:${process.env.PATH}:/Users/admin/bin:/usr/local/bin:/opt/homebrew/bin`,
      },
      timeout: 30000,
    })

    console.log('nself init output:', stdout)
    if (stderr && !stderr.includes('warning')) {
      console.error('nself init stderr:', stderr)
    }

    // Now read the generated .env.local
    const env = await readEnvFile()
    if (env) {
      const wizardConfig = envToWizardConfig(env)
      // Merge the wizard config with raw env values so validation can check for existing keys
      const config = { ...wizardConfig, ...env }
      return NextResponse.json({
        success: true,
        hasEnvFile: true,
        config,
        message: 'Initialized new project with nself init',
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read .env.local after init',
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error('Error in wizard init:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize wizard',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
