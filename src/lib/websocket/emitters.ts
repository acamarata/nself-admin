/**
 * WebSocket Event Emitters
 * Helper functions to emit events to connected WebSocket clients
 */

import {
  BuildProgressEvent,
  DbQueryResultEvent,
  DeployProgressEvent,
  DockerStatsEvent,
  EventType,
  LogStreamEvent,
  ServiceStatusEvent,
} from '@/lib/websocket/events'
import { getWebSocketServer } from '@/lib/websocket/server'

/**
 * Emit service status update
 */
export function emitServiceStatus(
  data: ServiceStatusEvent,
  room?: string,
): void {
  try {
    const wsServer = getWebSocketServer()
    if (room) {
      wsServer.broadcastToRoom(room, EventType.SERVICE_STATUS, data)
    } else {
      wsServer.broadcast(EventType.SERVICE_STATUS, data)
    }
  } catch (error) {
    console.error('Failed to emit service status:', error)
  }
}

/**
 * Emit build progress update
 */
export function emitBuildProgress(
  data: BuildProgressEvent,
  room?: string,
): void {
  try {
    const wsServer = getWebSocketServer()
    if (room) {
      wsServer.broadcastToRoom(room, EventType.BUILD_PROGRESS, data)
    } else {
      wsServer.broadcast(EventType.BUILD_PROGRESS, data)
    }
  } catch (error) {
    console.error('Failed to emit build progress:', error)
  }
}

/**
 * Emit deploy progress update
 */
export function emitDeployProgress(
  data: DeployProgressEvent,
  room?: string,
): void {
  try {
    const wsServer = getWebSocketServer()
    if (room) {
      wsServer.broadcastToRoom(room, EventType.DEPLOY_PROGRESS, data)
    } else {
      wsServer.broadcast(EventType.DEPLOY_PROGRESS, data)
    }
  } catch (error) {
    console.error('Failed to emit deploy progress:', error)
  }
}

/**
 * Emit log stream event
 */
export function emitLogStream(data: LogStreamEvent, room?: string): void {
  try {
    const wsServer = getWebSocketServer()
    if (room) {
      wsServer.batchEvent(room, EventType.LOGS_STREAM, data)
    } else {
      wsServer.broadcast(EventType.LOGS_STREAM, data)
    }
  } catch (error) {
    console.error('Failed to emit log stream:', error)
  }
}

/**
 * Emit Docker stats update
 */
export function emitDockerStats(data: DockerStatsEvent, room?: string): void {
  try {
    const wsServer = getWebSocketServer()
    if (room) {
      wsServer.batchEvent(room, EventType.DOCKER_STATS, data)
    } else {
      wsServer.broadcast(EventType.DOCKER_STATS, data)
    }
  } catch (error) {
    console.error('Failed to emit Docker stats:', error)
  }
}

/**
 * Emit database query result
 */
export function emitDbQueryResult(
  data: DbQueryResultEvent,
  room?: string,
): void {
  try {
    const wsServer = getWebSocketServer()
    if (room) {
      wsServer.broadcastToRoom(room, EventType.DB_QUERY_RESULT, data)
    } else {
      wsServer.broadcast(EventType.DB_QUERY_RESULT, data)
    }
  } catch (error) {
    console.error('Failed to emit database query result:', error)
  }
}
