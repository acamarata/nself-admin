import fs from 'fs/promises'
import {
  checkProjectStatus,
  getDockerStatus,
  getProjectPath,
} from '../project-utils'

// Mock fs/promises
jest.mock('fs/promises')

// Mock dockerode
jest.mock('dockerode', () => {
  return jest.fn().mockImplementation(() => ({
    listContainers: jest.fn(),
    getContainer: jest.fn(),
  }))
})

// Mock child_process
jest.mock('child_process', () => ({
  exec: jest.fn(),
}))

describe('Project Utils', () => {
  const mockFs = fs as jest.Mocked<typeof fs>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NSELF_PROJECT_PATH = '/test/project'
  })

  describe('getProjectPath', () => {
    it('should return project path from environment', () => {
      const projectPath = getProjectPath()
      expect(projectPath).toBe('/test/project')
    })

    it('should return default path when env not set', () => {
      delete process.env.NSELF_PROJECT_PATH
      const projectPath = getProjectPath()
      expect(projectPath).toBe('/workspace')
    })
  })

  describe('checkProjectStatus', () => {
    it('should detect project that is built and ready', async () => {
      // Mock fs.existsSync for docker-compose.yml
      const mockExistsSync = jest.fn()
      mockExistsSync.mockImplementation((path) => {
        if (String(path).includes('docker-compose.yml')) return true
        return true // project path exists
      })
      // Mock fs.readdirSync
      const mockReaddirSync = jest
        .fn()
        .mockReturnValue(['docker-compose.yml', '.env'])

      // Replace fs methods
      const originalExistsSync = require('fs').existsSync
      const originalReaddirSync = require('fs').readdirSync
      require('fs').existsSync = mockExistsSync
      require('fs').readdirSync = mockReaddirSync

      const status = await checkProjectStatus()

      expect(status).toEqual({
        status: 'built',
        path: '/test/project',
      })

      // Restore original methods
      require('fs').existsSync = originalExistsSync
      require('fs').readdirSync = originalReaddirSync
    })

    it('should detect uninitialized project', async () => {
      // Mock fs.existsSync to return false (directory doesn't exist)
      const mockExistsSync = jest.fn().mockReturnValue(false)

      const originalExistsSync = require('fs').existsSync
      require('fs').existsSync = mockExistsSync

      const status = await checkProjectStatus()

      expect(status).toEqual({
        status: 'not_initialized',
        path: '/test/project',
        error: 'Project directory does not exist',
      })

      // Restore original method
      require('fs').existsSync = originalExistsSync
    })

    it('should detect empty project directory', async () => {
      const mockExistsSync = jest.fn().mockReturnValue(true)
      const mockReaddirSync = jest.fn().mockReturnValue([]) // empty directory

      const originalExistsSync = require('fs').existsSync
      const originalReaddirSync = require('fs').readdirSync
      require('fs').existsSync = mockExistsSync
      require('fs').readdirSync = mockReaddirSync

      const status = await checkProjectStatus()

      expect(status).toEqual({
        status: 'not_initialized',
        path: '/test/project',
      })

      // Restore original methods
      require('fs').existsSync = originalExistsSync
      require('fs').readdirSync = originalReaddirSync
    })

    it('should detect initialized but not built project', async () => {
      const mockExistsSync = jest.fn()
      mockExistsSync.mockImplementation((path) => {
        if (String(path).includes('docker-compose.yml')) return false
        return true // project path exists
      })
      const mockReaddirSync = jest
        .fn()
        .mockReturnValue(['.env', 'some-file.txt'])

      const originalExistsSync = require('fs').existsSync
      const originalReaddirSync = require('fs').readdirSync
      require('fs').existsSync = mockExistsSync
      require('fs').readdirSync = mockReaddirSync

      const status = await checkProjectStatus()

      expect(status).toEqual({
        status: 'initialized',
        path: '/test/project',
      })

      // Restore original methods
      require('fs').existsSync = originalExistsSync
      require('fs').readdirSync = originalReaddirSync
    })
  })

  describe('getDockerStatus', () => {
    it('should return running containers status', async () => {
      const Docker = require('dockerode')
      const mockDocker = new Docker()
      mockDocker.listContainers.mockResolvedValue([
        {
          Id: 'container1',
          Names: ['/project_service1_1'],
          State: 'running',
          Status: 'Up 5 minutes',
        },
        {
          Id: 'container2',
          Names: ['/project_service2_1'],
          State: 'running',
          Status: 'Up 10 minutes',
        },
      ])

      const status = await getDockerStatus()

      expect(status).toEqual({
        running: true,
        containers: [
          {
            id: 'container1',
            name: 'project_service1_1',
            state: 'running',
            status: 'Up 5 minutes',
          },
          {
            id: 'container2',
            name: 'project_service2_1',
            state: 'running',
            status: 'Up 10 minutes',
          },
        ],
        error: null,
      })
    })

    it('should handle Docker not available', async () => {
      const Docker = require('dockerode')
      const mockDocker = new Docker()
      mockDocker.listContainers.mockRejectedValue(
        new Error('Cannot connect to Docker'),
      )

      const status = await getDockerStatus()

      expect(status).toEqual({
        running: false,
        containers: [],
        error: 'Cannot connect to Docker',
      })
    })

    it('should return false when no containers running', async () => {
      const Docker = require('dockerode')
      const mockDocker = new Docker()
      mockDocker.listContainers.mockResolvedValue([])

      const status = await getDockerStatus()

      expect(status).toEqual({
        running: false,
        containers: [],
        error: null,
      })
    })
  })
})
