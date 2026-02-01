import os from 'os'
import path from 'path'

// Use mutable type for process.env manipulation in tests
type MutableEnv = Record<string, string | undefined>

describe('paths utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    // Create a fresh copy of process.env
    process.env = { ...originalEnv }
    // Clear the specific env vars we're testing
    delete (process.env as MutableEnv).NSELF_PROJECT_PATH
    delete (process.env as MutableEnv).PROJECT_PATH
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getProjectPath', () => {
    it('uses NSELF_PROJECT_PATH if set', () => {
      process.env.NSELF_PROJECT_PATH = '/custom/path'
      // Re-import to get fresh function with new env
      const { getProjectPath } = require('../paths')
      const result = getProjectPath()
      expect(result).toBe('/custom/path')
    })

    it('uses PROJECT_PATH if NSELF_PROJECT_PATH not set', () => {
      delete process.env.NSELF_PROJECT_PATH
      process.env.PROJECT_PATH = '/fallback/path'
      const { getProjectPath } = require('../paths')
      const result = getProjectPath()
      expect(result).toBe('/fallback/path')
    })

    it('uses default path in development', () => {
      delete (process.env as MutableEnv).NSELF_PROJECT_PATH
      delete (process.env as MutableEnv).PROJECT_PATH
      delete (process.env as MutableEnv).NODE_ENV
      const { getProjectPath } = require('../paths')
      const result = getProjectPath()
      // In development with no env vars, it resolves '../nself-project' relative to cwd
      expect(result).toBeTruthy()
      expect(result).toContain('nself-project')
    })

    it('expands tilde to home directory', () => {
      process.env.NSELF_PROJECT_PATH = '~/my-project'
      const { getProjectPath } = require('../paths')
      const result = getProjectPath()
      expect(result).toBe(path.join(os.homedir(), 'my-project'))
    })

    it('returns absolute paths as-is', () => {
      process.env.NSELF_PROJECT_PATH = '/absolute/path'
      const { getProjectPath } = require('../paths')
      const result = getProjectPath()
      expect(result).toBe('/absolute/path')
    })
  })

  describe('getDockerSocketPath', () => {
    it('returns docker socket path in production', () => {
      ;(process.env as MutableEnv).NODE_ENV = 'production'
      const { getDockerSocketPath } = require('../paths')
      const result = getDockerSocketPath()
      expect(result).toBe('/var/run/docker.sock')
    })

    it('returns docker socket path in development', () => {
      delete (process.env as MutableEnv).NODE_ENV
      const { getDockerSocketPath } = require('../paths')
      const result = getDockerSocketPath()
      // In development, it returns the first path from possiblePaths
      expect(result).toBe('/var/run/docker.sock')
    })
  })
})
