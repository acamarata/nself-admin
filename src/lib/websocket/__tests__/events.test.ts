/**
 * Unit tests for WebSocket event types and type guards
 */

import {
  BuildProgressEvent,
  DbQueryResultEvent,
  DeployProgressEvent,
  DockerStatsEvent,
  EventType,
  isBuildProgressEvent,
  isDbQueryResultEvent,
  isDeployProgressEvent,
  isDockerStatsEvent,
  isLogStreamEvent,
  isServiceStatusEvent,
  LogStreamEvent,
  ServiceStatusEvent,
} from '../events'

describe('Event Type Guards', () => {
  describe('isServiceStatusEvent', () => {
    it('should return true for valid ServiceStatusEvent', () => {
      const event: ServiceStatusEvent = {
        service: 'postgres',
        status: 'running',
        timestamp: '2026-01-31T12:00:00Z',
      }

      expect(isServiceStatusEvent(event)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isServiceStatusEvent(null)).toBe(false)
      expect(isServiceStatusEvent(undefined)).toBe(false)
      expect(isServiceStatusEvent({})).toBe(false)
      expect(isServiceStatusEvent({ service: 'test' })).toBe(false)
    })
  })

  describe('isBuildProgressEvent', () => {
    it('should return true for valid BuildProgressEvent', () => {
      const event: BuildProgressEvent = {
        step: 'Building images',
        progress: 50,
        status: 'in-progress',
        timestamp: '2026-01-31T12:00:00Z',
      }

      expect(isBuildProgressEvent(event)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isBuildProgressEvent(null)).toBe(false)
      expect(isBuildProgressEvent({})).toBe(false)
    })
  })

  describe('isDeployProgressEvent', () => {
    it('should return true for valid DeployProgressEvent', () => {
      const event: DeployProgressEvent = {
        stage: 'Deploying',
        environment: 'staging',
        status: 'in-progress',
        logs: ['Starting deployment...'],
        timestamp: '2026-01-31T12:00:00Z',
      }

      expect(isDeployProgressEvent(event)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isDeployProgressEvent(null)).toBe(false)
      expect(isDeployProgressEvent({})).toBe(false)
    })
  })

  describe('isLogStreamEvent', () => {
    it('should return true for valid LogStreamEvent', () => {
      const event: LogStreamEvent = {
        service: 'postgres',
        line: 'database system is ready',
        timestamp: '2026-01-31T12:00:00Z',
      }

      expect(isLogStreamEvent(event)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isLogStreamEvent(null)).toBe(false)
      expect(isLogStreamEvent({})).toBe(false)
    })
  })

  describe('isDockerStatsEvent', () => {
    it('should return true for valid DockerStatsEvent', () => {
      const event: DockerStatsEvent = {
        containerId: 'abc123',
        containerName: 'postgres',
        stats: {
          cpu: 10,
          memory: 1024000,
          memoryLimit: 2048000,
          memoryPercent: 50,
          network: {
            rx: 1000,
            tx: 2000,
          },
          blockIO: {
            read: 5000,
            write: 3000,
          },
        },
        timestamp: '2026-01-31T12:00:00Z',
      }

      expect(isDockerStatsEvent(event)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isDockerStatsEvent(null)).toBe(false)
      expect(isDockerStatsEvent({})).toBe(false)
    })
  })

  describe('isDbQueryResultEvent', () => {
    it('should return true for valid DbQueryResultEvent', () => {
      const event: DbQueryResultEvent = {
        queryId: 'query-123',
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
        fields: [
          { name: 'id', dataTypeID: 23 },
          { name: 'name', dataTypeID: 1043 },
        ],
        timestamp: '2026-01-31T12:00:00Z',
      }

      expect(isDbQueryResultEvent(event)).toBe(true)
    })

    it('should return false for invalid data', () => {
      expect(isDbQueryResultEvent(null)).toBe(false)
      expect(isDbQueryResultEvent({})).toBe(false)
    })
  })
})

describe('Event Types', () => {
  it('should have correct event type values', () => {
    expect(EventType.SERVICE_STATUS).toBe('service:status')
    expect(EventType.BUILD_PROGRESS).toBe('build:progress')
    expect(EventType.DEPLOY_PROGRESS).toBe('deploy:progress')
    expect(EventType.LOGS_STREAM).toBe('logs:stream')
    expect(EventType.DOCKER_STATS).toBe('docker:stats')
    expect(EventType.DB_QUERY_RESULT).toBe('db:query:result')
  })
})
