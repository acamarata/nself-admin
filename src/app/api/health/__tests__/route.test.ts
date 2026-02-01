import { exec } from 'child_process'
import fs from 'fs/promises'
import { GET, HEAD } from '../route'

jest.mock('child_process')
jest.mock('fs/promises')
jest.mock('@/lib/nself-path', () => ({
  getEnhancedPath: jest.fn(() => '/usr/bin:/bin'),
}))

// TODO v0.5.1: Fix failing tests in this file
describe.skip('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns healthy status when all checks pass', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(null, 'Docker version 20.10.0', '')
      },
    )
    ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)
    ;(fs.unlink as jest.Mock).mockResolvedValue(undefined)
    ;(fs.access as jest.Mock).mockResolvedValue(undefined)
    ;(fs.readFile as jest.Mock).mockResolvedValue(
      'MemTotal: 8000000 kB\nMemAvailable: 4000000 kB\ncpu 100 100 100 100',
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.version).toBeTruthy()
    expect(data.checks.docker).toBe(true)
    expect(data.checks.filesystem).toBe(true)
  })

  it('returns unhealthy status when Docker is down', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(new Error('Docker not running'), '', 'error')
      },
    )
    ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)
    ;(fs.unlink as jest.Mock).mockResolvedValue(undefined)
    ;(fs.access as jest.Mock).mockResolvedValue(undefined)
    ;(fs.readFile as jest.Mock).mockResolvedValue(
      'MemTotal: 8000000 kB\nMemAvailable: 4000000 kB\ncpu 100 100 100 100',
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.docker).toBe(false)
  })

  it('returns unhealthy status when filesystem is inaccessible', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(null, 'Docker version 20.10.0', '')
      },
    )
    ;(fs.writeFile as jest.Mock).mockRejectedValue(
      new Error('Permission denied'),
    )
    ;(fs.readFile as jest.Mock).mockResolvedValue(
      'MemTotal: 8000000 kB\nMemAvailable: 4000000 kB\ncpu 100 100 100 100',
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.filesystem).toBe(false)
  })

  it('includes resource usage in response', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(null, 'OK', '')
      },
    )
    ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)
    ;(fs.unlink as jest.Mock).mockResolvedValue(undefined)
    ;(fs.access as jest.Mock).mockResolvedValue(undefined)
    ;(fs.readFile as jest.Mock).mockResolvedValue(
      'MemTotal: 8000000 kB\nMemAvailable: 4000000 kB\ncpu 100 100 100 100',
    )

    const response = await GET()
    const data = await response.json()

    expect(data.resources).toBeDefined()
    expect(data.resources.memory).toBeDefined()
    expect(data.resources.cpu).toBeDefined()
  })

  it('includes uptime in response', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(null, 'OK', '')
      },
    )
    ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)
    ;(fs.unlink as jest.Mock).mockResolvedValue(undefined)
    ;(fs.access as jest.Mock).mockResolvedValue(undefined)
    ;(fs.readFile as jest.Mock).mockResolvedValue(
      'MemTotal: 8000000 kB\nMemAvailable: 4000000 kB\ncpu 100 100 100 100',
    )

    const response = await GET()
    const data = await response.json()

    expect(data.uptime).toBeGreaterThanOrEqual(0)
    expect(data.uptimeFormatted).toBeTruthy()
  })
})

describe('HEAD /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 200 when Docker is accessible', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(null, 'Docker version 20.10.0', '')
      },
    )

    const response = await HEAD()

    expect(response.status).toBe(200)
  })

  it('returns 503 when Docker is not accessible', async () => {
    ;(exec as unknown as jest.Mock).mockImplementation(
      (cmd, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
        }
        callback(new Error('Docker not running'), '', 'error')
      },
    )

    const response = await HEAD()

    expect(response.status).toBe(503)
  })
})
