import { getProjectPath } from '@/lib/paths'
import { exec, execFile } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'
import { z } from 'zod'

const _execAsync = promisify(exec) // Reserved for future use
const execFileAsync = promisify(execFile)

// Define allowed nself subcommands and their valid arguments
const ALLOWED_NSELF_COMMANDS: Record<
  string,
  { args?: string[]; options?: string[] }
> = {
  init: { options: ['--template', '--force'] },
  build: { options: ['--clean', '--verbose'] },
  start: { args: ['all'], options: ['--detach', '--force-recreate'] },
  stop: { args: ['all'], options: ['--timeout'] },
  status: { options: ['--json', '--verbose'] },
  logs: { args: ['service'], options: ['--follow', '--tail', '--since'] },
  doctor: { options: ['--fix', '--verbose'] },
  backup: { options: ['--output', '--compress'] },
  restore: { args: ['file'], options: ['--force'] },
  monitor: { options: ['--enable', '--disable'] },
  urls: { options: ['--format'] },
  help: {},
  version: {},
}

// Schema for command validation
const commandSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  options: z.record(z.string(), z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Parse the command string or structured command
    let parsedCommand: {
      command: string
      args?: string[]
      options?: Record<string, string>
    }

    if (typeof body.command === 'string') {
      // Parse string command into structured format
      const parts = body.command.trim().split(/\s+/)

      if (parts[0] !== 'nself') {
        return NextResponse.json(
          { success: false, error: 'Only nself commands are allowed' },
          { status: 403 },
        )
      }

      const subcommand = parts[1]
      if (!subcommand || !ALLOWED_NSELF_COMMANDS[subcommand]) {
        return NextResponse.json(
          { success: false, error: `Invalid nself command: ${subcommand}` },
          { status: 403 },
        )
      }

      // Extract args and options from the rest of the command
      const args: string[] = []
      const options: Record<string, string> = {}

      for (let i = 2; i < parts.length; i++) {
        if (parts[i].startsWith('--')) {
          const optName = parts[i]
          const optValue =
            i + 1 < parts.length && !parts[i + 1].startsWith('--')
              ? parts[++i]
              : 'true'
          options[optName] = optValue
        } else if (!parts[i].startsWith('-')) {
          args.push(parts[i])
        }
      }

      parsedCommand = { command: subcommand, args, options }
    } else {
      parsedCommand = commandSchema.parse(body)

      if (!ALLOWED_NSELF_COMMANDS[parsedCommand.command]) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid nself command: ${parsedCommand.command}`,
          },
          { status: 403 },
        )
      }
    }

    const backendPath = getProjectPath()

    try {
      // Build command arguments safely
      const cmdArgs = ['nself', parsedCommand.command]

      // Add validated arguments
      if (parsedCommand.args) {
        const allowedArgs =
          ALLOWED_NSELF_COMMANDS[parsedCommand.command].args || []
        for (const arg of parsedCommand.args) {
          // Validate argument is allowed or matches pattern
          if (
            allowedArgs.includes(arg) ||
            (parsedCommand.command === 'logs' && /^[a-z0-9_-]+$/i.test(arg)) ||
            (parsedCommand.command === 'restore' &&
              /^\/backups\/[a-z0-9_\-.]+$/i.test(arg))
          ) {
            cmdArgs.push(arg)
          } else {
            return NextResponse.json(
              { success: false, error: `Invalid argument: ${arg}` },
              { status: 400 },
            )
          }
        }
      }

      // Add validated options
      if (parsedCommand.options) {
        const allowedOptions =
          ALLOWED_NSELF_COMMANDS[parsedCommand.command].options || []
        for (const [opt, value] of Object.entries(parsedCommand.options)) {
          if (allowedOptions.includes(opt)) {
            cmdArgs.push(opt)
            if (value !== 'true') {
              // Validate option values
              if (opt === '--tail' && !/^\d+$/.test(value)) {
                return NextResponse.json(
                  { success: false, error: 'Invalid tail value' },
                  { status: 400 },
                )
              }
              if (
                opt === '--output' &&
                !/^\/backups\/[a-z0-9_\-.]+$/i.test(value)
              ) {
                return NextResponse.json(
                  { success: false, error: 'Invalid output path' },
                  { status: 400 },
                )
              }
              cmdArgs.push(value)
            }
          } else {
            return NextResponse.json(
              { success: false, error: `Invalid option: ${opt}` },
              { status: 400 },
            )
          }
        }
      }

      // Use execFile for safety - prevents shell injection
      const { stdout, stderr } = await execFileAsync(
        '/bin/sh',
        ['-c', `cd "${backendPath}" && "${cmdArgs.join('" "')}"`],
        {
          env: {
            ...process.env,
            PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin',
            FORCE_COLOR: '0',
          },
          timeout: 300000,
        },
      )

      return NextResponse.json({
        success: true,
        output: stdout || stderr || 'Command executed successfully',
        stdout,
        stderr,
      })
    } catch (execError: any) {
      // Command failed but we still want to return the output
      return NextResponse.json({
        success: false,
        error: execError.message,
        output: execError.stdout || execError.stderr || execError.message,
        stdout: execError.stdout,
        stderr: execError.stderr,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute command',
        details:
          error instanceof Error
            ? error?.message || 'Unknown error'
            : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
