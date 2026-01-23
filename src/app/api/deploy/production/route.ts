import { getEnhancedPath } from '@/lib/nself-path'
import { getProjectPath } from '@/lib/paths'
import { exec } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'

const execAsync = promisify(exec)

// GET /api/deploy/production - Get production status
export async function GET() {
  try {
    const projectPath = getProjectPath()

    try {
      const { stdout, stderr } = await execAsync('nself prod status', {
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
        error: 'Failed to get production status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST /api/deploy/production - Execute production commands
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options = {} } = body
    const projectPath = getProjectPath()

    let command = ''

    switch (action) {
      case 'init':
        // nself prod init <domain> [--email <email>]
        command = `nself prod init ${options.domain}`
        if (options.email) command += ` --email ${options.email}`
        break

      case 'check':
      case 'audit':
        // nself prod check [--verbose]
        command = 'nself prod check'
        if (options.verbose) command += ' --verbose'
        break

      case 'secrets': {
        // nself prod secrets <action> [options]
        const secretAction = options.secretAction || 'show'
        command = `nself prod secrets ${secretAction}`
        if (secretAction === 'generate' && options.force) {
          command += ' --force'
        }
        if (secretAction === 'rotate' && options.secretName) {
          command = `nself prod secrets rotate ${options.secretName}`
        }
        if (secretAction === 'show' && options.unmask) {
          command += ' --unmask'
        }
        break
      }

      case 'ssl': {
        // nself prod ssl <action> [options]
        const sslAction = options.sslAction || 'status'
        command = `nself prod ssl ${sslAction}`
        if (sslAction === 'request') {
          command += ` ${options.domain}`
          if (options.email) command += ` --email ${options.email}`
          if (options.staging) command += ' --staging'
        }
        if (sslAction === 'renew' && options.force) {
          command += ' --force'
        }
        if (sslAction === 'self-signed' && options.domain) {
          command += ` ${options.domain}`
        }
        break
      }

      case 'firewall': {
        // nself prod firewall <action> [options]
        const fwAction = options.firewallAction || 'status'
        command = `nself prod firewall ${fwAction}`
        if (fwAction === 'configure' && options.dryRun) {
          command += ' --dry-run'
        }
        if (fwAction === 'allow' && options.port) {
          command = `nself prod firewall allow ${options.port}`
          if (options.protocol) command += ` ${options.protocol}`
        }
        if (fwAction === 'block' && options.port) {
          command = `nself prod firewall block ${options.port}`
        }
        break
      }

      case 'harden':
        // nself prod harden [--dry-run] [--skip-firewall]
        command = 'nself prod harden'
        if (options.dryRun) command += ' --dry-run'
        if (options.skipFirewall) command += ' --skip-firewall'
        break

      case 'deploy':
        // nself deploy prod [options]
        command = 'nself deploy prod'
        if (options.dryRun) command += ' --dry-run'
        if (options.force) command += ' --force'
        if (options.rolling) command += ' --rolling'
        if (options.skipHealth) command += ' --skip-health'
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
      timeout: 300000, // 5 minute timeout
    })

    return NextResponse.json({
      success: true,
      action,
      output: stdout.trim(),
      stderr: stderr.trim(),
    })
  } catch (error) {
    const execError = error as { message?: string; stdout?: string; stderr?: string }
    return NextResponse.json(
      {
        success: false,
        error: 'Production action failed',
        details: execError.message || 'Unknown error',
        stdout: execError.stdout || '',
        stderr: execError.stderr || '',
      },
      { status: 500 }
    )
  }
}
