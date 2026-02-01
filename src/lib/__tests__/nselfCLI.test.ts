import { execFile } from 'child_process'
import { promisify } from 'util'
import {
  executeNselfCommand,
  nselfBackup,
  nselfBuild,
  nselfConfig,
  nselfDatabase,
  nselfDbAnalyze,
  nselfDbBackup,
  nselfDbMigrate,
  nselfDbReset,
  nselfDbRestore,
  nselfDbSeed,
  nselfDbSync,
  nselfDeploy,
  nselfDoctor,
  nselfExport,
  nselfHealth,
  nselfHelp,
  nselfInit,
  nselfLogs,
  nselfMonitor,
  nselfProdDeploy,
  nselfRestart,
  nselfRestore,
  nselfScale,
  nselfSecrets,
  nselfSslGenerate,
  nselfSslTrust,
  nselfStagingDeploy,
  nselfStart,
  nselfStatus,
  nselfStop,
  nselfUpdate,
  nselfUrls,
  nselfVersion,
  streamNselfCommand,
} from '../nselfCLI'

jest.mock('child_process')
jest.mock('util')

const mockExecFile = execFile as jest.MockedFunction<typeof execFile>
const mockPromisify = promisify as jest.MockedFunction<typeof promisify>

describe('nself CLI Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock promisify to return a function that returns success
    mockPromisify.mockReturnValue(
      jest.fn().mockResolvedValue({
        stdout: 'success',
        stderr: '',
      }),
    )
  })

  describe('executeNselfCommand', () => {
    it('should execute valid commands', async () => {
      const result = await executeNselfCommand('status')
      expect(result.success).toBe(true)
      expect(result.stdout).toBe('success')
    })

    it('should reject invalid commands', async () => {
      await expect(
        executeNselfCommand('invalid-command' as any),
      ).rejects.toThrow('Invalid nself command')
    })

    it('should pass arguments correctly', async () => {
      const mockFn = jest.fn().mockResolvedValue({
        stdout: 'output',
        stderr: '',
      })
      mockPromisify.mockReturnValue(mockFn)

      await executeNselfCommand('logs', ['postgres', '-n100'])
      expect(mockFn).toHaveBeenCalled()
    })

    it('should filter out invalid arguments', async () => {
      const mockFn = jest.fn().mockResolvedValue({
        stdout: 'output',
        stderr: '',
      })
      mockPromisify.mockReturnValue(mockFn)

      await executeNselfCommand('status', [
        'valid',
        '',
        null as any,
        undefined as any,
        123 as any,
      ])
      expect(mockFn).toHaveBeenCalled()
    })

    it('should handle command timeouts', async () => {
      mockPromisify.mockReturnValue(
        jest.fn().mockRejectedValue({
          code: 'ETIMEDOUT',
          stdout: Buffer.from(''),
          stderr: Buffer.from('Command timed out'),
        }),
      )

      const result = await executeNselfCommand('start', [], { timeout: 1000 })
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should handle command failures', async () => {
      mockPromisify.mockReturnValue(
        jest.fn().mockRejectedValue({
          code: 1,
          stdout: Buffer.from('partial output'),
          stderr: Buffer.from('error message'),
          message: 'Command failed',
        }),
      )

      const result = await executeNselfCommand('build')
      expect(result.success).toBe(false)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('error message')
    })

    it('should apply custom options', async () => {
      const mockFn = jest.fn().mockResolvedValue({
        stdout: 'output',
        stderr: '',
      })
      mockPromisify.mockReturnValue(mockFn)

      await executeNselfCommand('status', [], {
        timeout: 5000,
        cwd: '/custom/path',
        env: { CUSTOM_VAR: 'value' },
      })

      expect(mockFn).toHaveBeenCalled()
    })
  })

  describe('Core Lifecycle Commands', () => {
    it('should execute nselfStatus', async () => {
      const result = await nselfStatus()
      expect(result.success).toBe(true)
    })

    it('should execute nselfStart', async () => {
      const result = await nselfStart()
      expect(result.success).toBe(true)
    })

    it('should execute nselfStop', async () => {
      const result = await nselfStop()
      expect(result.success).toBe(true)
    })

    it('should execute nselfRestart', async () => {
      const result = await nselfRestart()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDoctor', async () => {
      const result = await nselfDoctor()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDoctor with fix flag', async () => {
      const result = await nselfDoctor(true)
      expect(result.success).toBe(true)
    })
  })

  describe('Log Commands', () => {
    it('should execute nselfLogs without arguments', async () => {
      const result = await nselfLogs()
      expect(result.success).toBe(true)
    })

    it('should execute nselfLogs with service', async () => {
      const result = await nselfLogs('postgres')
      expect(result.success).toBe(true)
    })

    it('should execute nselfLogs with service and lines', async () => {
      const result = await nselfLogs('postgres', 100)
      expect(result.success).toBe(true)
    })
  })

  describe('Backup and Restore Commands', () => {
    it('should execute nselfBackup without path', async () => {
      const result = await nselfBackup()
      expect(result.success).toBe(true)
    })

    it('should execute nselfBackup with output path', async () => {
      const result = await nselfBackup('/tmp/backup.tar.gz')
      expect(result.success).toBe(true)
    })

    it('should execute nselfRestore', async () => {
      const result = await nselfRestore('/tmp/backup.tar.gz')
      expect(result.success).toBe(true)
    })
  })

  describe('Config Commands', () => {
    it('should execute nselfConfig get', async () => {
      const result = await nselfConfig('get', 'key')
      expect(result.success).toBe(true)
    })

    it('should execute nselfConfig set', async () => {
      const result = await nselfConfig('set', 'key', 'value')
      expect(result.success).toBe(true)
    })
  })

  describe('Database Commands', () => {
    it('should execute nselfDatabase', async () => {
      const result = await nselfDatabase('SELECT * FROM users')
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbSync', async () => {
      const result = await nselfDbSync()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbSeed', async () => {
      const result = await nselfDbSeed()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbSeed with force', async () => {
      const result = await nselfDbSeed({ force: true })
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbMigrate', async () => {
      const result = await nselfDbMigrate()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbMigrate with target', async () => {
      const result = await nselfDbMigrate({ target: 'v2.0.0' })
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbBackup', async () => {
      const result = await nselfDbBackup()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbBackup with output path', async () => {
      const result = await nselfDbBackup('/tmp/db-backup.sql')
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbRestore', async () => {
      const result = await nselfDbRestore('/tmp/db-backup.sql')
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbReset', async () => {
      const result = await nselfDbReset()
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbReset with force', async () => {
      const result = await nselfDbReset({ force: true })
      expect(result.success).toBe(true)
    })

    it('should execute nselfDbAnalyze', async () => {
      const result = await nselfDbAnalyze()
      expect(result.success).toBe(true)
    })
  })

  describe('Deployment Commands', () => {
    it('should execute nselfDeploy', async () => {
      const result = await nselfDeploy('staging')
      expect(result.success).toBe(true)
    })

    it('should execute nselfDeploy with options', async () => {
      const result = await nselfDeploy('production', {
        branch: 'main',
        tag: 'v1.0.0',
      })
      expect(result.success).toBe(true)
    })

    it('should execute nselfStagingDeploy', async () => {
      const result = await nselfStagingDeploy()
      expect(result.success).toBe(true)
    })

    it('should execute nselfProdDeploy', async () => {
      const result = await nselfProdDeploy()
      expect(result.success).toBe(true)
    })
  })

  describe('SSL Commands', () => {
    it('should execute nselfSslGenerate', async () => {
      const result = await nselfSslGenerate()
      expect(result.success).toBe(true)
    })

    it('should execute nselfSslGenerate with domain', async () => {
      const result = await nselfSslGenerate('example.com')
      expect(result.success).toBe(true)
    })

    it('should execute nselfSslTrust', async () => {
      const result = await nselfSslTrust()
      expect(result.success).toBe(true)
    })
  })

  describe('Build and Init Commands', () => {
    it('should execute nselfBuild', async () => {
      const result = await nselfBuild()
      expect(result.success).toBe(true)
    })

    it('should execute nselfBuild with force', async () => {
      const result = await nselfBuild({ force: true })
      expect(result.success).toBe(true)
    })

    it('should execute nselfInit', async () => {
      const result = await nselfInit()
      expect(result.success).toBe(true)
    })

    it('should execute nselfInit with full', async () => {
      const result = await nselfInit({ full: true })
      expect(result.success).toBe(true)
    })
  })

  describe('Utility Commands', () => {
    it('should execute nselfUpdate', async () => {
      const result = await nselfUpdate()
      expect(result.success).toBe(true)
    })

    it('should execute nselfVersion', async () => {
      const result = await nselfVersion()
      expect(result.success).toBe(true)
    })

    it('should execute nselfHelp', async () => {
      const result = await nselfHelp()
      expect(result.success).toBe(true)
    })

    it('should execute nselfHelp with command', async () => {
      const result = await nselfHelp('build')
      expect(result.success).toBe(true)
    })

    it('should execute nselfMonitor', async () => {
      const result = await nselfMonitor()
      expect(result.success).toBe(true)
    })

    it('should execute nselfMonitor with action', async () => {
      const result = await nselfMonitor('enable')
      expect(result.success).toBe(true)
    })

    it('should execute nselfUrls', async () => {
      const result = await nselfUrls()
      expect(result.success).toBe(true)
    })

    it('should execute nselfUrls with format', async () => {
      const result = await nselfUrls('json')
      expect(result.success).toBe(true)
    })

    it('should execute nselfSecrets', async () => {
      const result = await nselfSecrets('generate')
      expect(result.success).toBe(true)
    })

    it('should execute nselfSecrets with service', async () => {
      const result = await nselfSecrets('rotate', 'postgres')
      expect(result.success).toBe(true)
    })

    it('should execute nselfExport', async () => {
      const result = await nselfExport('compose')
      expect(result.success).toBe(true)
    })

    it('should execute nselfExport with output path', async () => {
      const result = await nselfExport('kubernetes', '/tmp/k8s.yaml')
      expect(result.success).toBe(true)
    })

    it('should execute nselfScale', async () => {
      const result = await nselfScale('api', 3)
      expect(result.success).toBe(true)
    })

    it('should execute nselfHealth', async () => {
      const result = await nselfHealth()
      expect(result.success).toBe(true)
    })

    it('should execute nselfHealth with service', async () => {
      const result = await nselfHealth('postgres')
      expect(result.success).toBe(true)
    })
  })

  describe('streamNselfCommand', () => {
    it('should reject invalid streaming commands', () => {
      expect(() => {
        streamNselfCommand('build' as any, [], () => {})
      }).toThrow('Invalid streaming command')
    })

    it('should accept valid streaming commands', () => {
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
      }

      ;(require('child_process').spawn as jest.Mock).mockReturnValue(mockSpawn)

      const kill = streamNselfCommand('logs', ['postgres'], () => {})
      expect(typeof kill).toBe('function')
    })

    it('should call onData callback', () => {
      const onData = jest.fn()
      const onError = jest.fn()
      const onClose = jest.fn()

      const mockStdout = {
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('log line 1\n')
          }
        }),
      }

      const mockStderr = {
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('error line\n')
          }
        }),
      }

      const mockSpawn = {
        stdout: mockStdout,
        stderr: mockStderr,
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0)
          }
        }),
        kill: jest.fn(),
      }

      ;(require('child_process').spawn as jest.Mock).mockReturnValue(mockSpawn)

      streamNselfCommand('logs', [], onData, onError, onClose)

      expect(onData).toHaveBeenCalledWith('log line 1\n')
      expect(onError).toHaveBeenCalledWith('error line\n')
      expect(onClose).toHaveBeenCalledWith(0)
    })

    it('should return kill function that stops the process', () => {
      const mockSpawn = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
      }

      ;(require('child_process').spawn as jest.Mock).mockReturnValue(mockSpawn)

      const kill = streamNselfCommand('logs', [], () => {})
      kill()

      expect(mockSpawn.kill).toHaveBeenCalled()
    })
  })

  describe('Security and Validation', () => {
    it('should only allow whitelisted commands', async () => {
      const invalidCommands = ['rm', 'cat', 'ls', 'sudo', 'exec']

      for (const cmd of invalidCommands) {
        await expect(executeNselfCommand(cmd as any)).rejects.toThrow(
          'Invalid nself command',
        )
      }
    })

    it('should sanitize arguments', async () => {
      const mockFn = jest.fn().mockResolvedValue({
        stdout: 'output',
        stderr: '',
      })
      mockPromisify.mockReturnValue(mockFn)

      // These should be filtered out
      await executeNselfCommand('status', ['', null as any, undefined as any])

      expect(mockFn).toHaveBeenCalled()
    })
  })
})
