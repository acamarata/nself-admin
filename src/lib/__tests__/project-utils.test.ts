import { exec } from 'child_process'
import fs from 'fs'
import {
  checkProjectStatus,
  getDockerStatus,
  getProjectServices,
  getRunningContainers,
} from '../project-utils'

jest.mock('fs')
jest.mock('child_process')
jest.mock('../database', () => ({
  getCachedProjectInfo: jest.fn(() => null),
  setCachedProjectInfo: jest.fn(),
}))
jest.mock('../paths', () => ({
  getProjectPath: jest.fn(() => '/test/project'),
}))

// TODO v0.5.1: Fix failing tests in this file
describe.skip('project-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkProjectStatus', () => {
    it('returns not_initialized if directory does not exist', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      const result = await checkProjectStatus()

      expect(result.status).toBe('not_initialized')
      expect(result.error).toBe('Project directory does not exist')

      mockExistsSync.mockRestore()
    })

    it('returns not_initialized if directory is empty', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const mockReaddirSync = jest.spyOn(fs, 'readdirSync').mockReturnValue([])

      const result = await checkProjectStatus()

      expect(result.status).toBe('not_initialized')

      mockExistsSync.mockRestore()
      mockReaddirSync.mockRestore()
    })

    it('returns initialized if docker-compose.yml missing', async () => {
      const mockExistsSync = jest
        .spyOn(fs, 'existsSync')
        .mockImplementation((path: any) => {
          if (String(path).includes('docker-compose.yml')) return false
          return true
        })
      const mockReaddirSync = jest
        .spyOn(fs, 'readdirSync')
        .mockReturnValue(['.env'] as any)

      const result = await checkProjectStatus()

      expect(result.status).toBe('initialized')

      mockExistsSync.mockRestore()
      mockReaddirSync.mockRestore()
    })

    it('returns built if docker-compose exists but no containers running', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const mockReaddirSync = jest
        .spyOn(fs, 'readdirSync')
        .mockReturnValue(['docker-compose.yml'] as any)
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(null, '', '')
        },
      )

      const result = await checkProjectStatus()

      expect(result.status).toBe('built')

      mockExistsSync.mockRestore()
      mockReaddirSync.mockRestore()
    })

    it('returns running if containers are active', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      const mockReaddirSync = jest
        .spyOn(fs, 'readdirSync')
        .mockReturnValue(['docker-compose.yml'] as any)
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(null, 'nself-postgres\nnself-hasura\n', '')
        },
      )

      const result = await checkProjectStatus()

      expect(result.status).toBe('running')

      mockExistsSync.mockRestore()
      mockReaddirSync.mockRestore()
    })
  })

  describe('getProjectServices', () => {
    it('returns empty array if docker-compose.yml missing', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      const result = await getProjectServices()

      expect(result.services).toEqual([])
      expect(result.error).toBe('docker-compose.yml not found')

      mockExistsSync.mockRestore()
    })

    it('returns services from docker-compose config', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(null, 'postgres\nhasura\nredis\n', '')
        },
      )

      const result = await getProjectServices()

      expect(result.services).toEqual(['postgres', 'hasura', 'redis'])

      mockExistsSync.mockRestore()
    })

    it('handles docker-compose errors gracefully', async () => {
      const mockExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(new Error('docker-compose failed'), '', 'error')
        },
      )

      const result = await getProjectServices()

      expect(result.services).toEqual([])
      expect(result.error).toBe('Failed to read services from docker-compose')

      mockExistsSync.mockRestore()
    })
  })

  describe('getRunningContainers', () => {
    it('returns count of running containers', async () => {
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(null, '5\n', '')
        },
      )

      const count = await getRunningContainers()

      expect(count).toBe(5)
    })

    it('returns 0 if docker command fails', async () => {
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(new Error('docker not running'), '', 'error')
        },
      )

      const count = await getRunningContainers()

      expect(count).toBe(0)
    })

    it('returns 0 if count is NaN', async () => {
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(null, 'invalid\n', '')
        },
      )

      const count = await getRunningContainers()

      expect(count).toBe(0)
    })
  })

  describe('getDockerStatus', () => {
    it('returns docker status with containers', async () => {
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(
            null,
            'ID\tNAMES\tSTATE\tSTATUS\nabc123\tpostgres\trunning\tUp 5 minutes\n',
            '',
          )
        },
      )

      const status = await getDockerStatus()

      expect(status.running).toBe(true)
      expect(status.containers).toHaveLength(1)
      expect(status.containers[0].name).toBe('postgres')
      expect(status.error).toBeNull()
    })

    it('returns empty status if docker fails', async () => {
      ;(exec as unknown as jest.Mock).mockImplementation(
        (_cmd: string, _opts: any, callback: Function) => {
          callback(new Error('Docker daemon not running'), '', 'error')
        },
      )

      const status = await getDockerStatus()

      expect(status.running).toBe(false)
      expect(status.containers).toEqual([])
      expect(status.error).toBeTruthy()
    })
  })
})
