import { exec } from 'child_process'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { promisify } from 'util'
import { getProjectPath } from '@/lib/paths'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { check } = await request.json()

    let result = { success: false, message: 'Unknown check' }

    switch (check) {
      case 'Docker is running':
        try {
          await execAsync('docker info')
          result = {
            success: true,
            message: 'Docker is running and accessible',
          }
        } catch (error: any) {
          result = {
            success: false,
            message: 'Docker is not running or not accessible',
          }
        }
        break

      case 'Project directory writable':
        try {
          const projectPath = getProjectPath()
          await fs.access(projectPath, fs.constants.W_OK)
          result = { success: true, message: 'Project directory is writable' }
        } catch (error: any) {
          result = {
            success: false,
            message: 'Cannot write to project directory',
          }
        }
        break

      case 'Network connectivity':
        try {
          // Simple network check
          await execAsync('ping -c 1 8.8.8.8')
          result = { success: true, message: 'Network connectivity confirmed' }
        } catch (error: any) {
          result = { success: false, message: 'No network connectivity' }
        }
        break

      case 'nself CLI available':
        try {
          const { stdout } = await execAsync('which nself')
          if (stdout.trim()) {
            result = {
              success: true,
              message: 'nself CLI found and accessible',
            }
          } else {
            throw new Error('nself not found')
          }
        } catch (error: any) {
          result = { success: false, message: 'nself CLI not found in PATH' }
        }
        break

      default:
        result = { success: false, message: 'Unknown system check' }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Check failed due to internal error' },
      { status: 500 },
    )
  }
}
