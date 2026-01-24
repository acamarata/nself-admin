import { EventEmitter } from 'events'

export interface WebSocketMessage {
  type: 'metrics' | 'logs' | 'containers' | 'health' | 'events' | 'error'
  payload: any
  timestamp: number
}

export interface MetricsData {
  cpu: {
    usage: number
    cores: number
    processes: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    rx: number
    tx: number
  }
}

export interface ContainerData {
  id: string
  name: string
  status: 'running' | 'stopped' | 'restarting' | 'error'
  health?: 'healthy' | 'unhealthy' | 'starting'
  cpu: number
  memory: number
  ports: string[]
  uptime: number
}

export interface LogEntry {
  timestamp: string
  container: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  metadata?: Record<string, any>
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private pingInterval: NodeJS.Timeout | null = null
  private subscriptions = new Set<string>()
  private isConnected = false

  constructor() {
    super()
    // WebSocket is currently disabled - endpoint not available
    // if (typeof window !== 'undefined') {
    //   this.connect()
    // }
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/api/ws`
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.getWebSocketUrl())

      this.ws.onopen = () => {
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected')

        this.startPing()

        this.subscriptions.forEach((topic) => {
          this.subscribe(topic)
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch {
          // Intentionally empty - skip malformed WebSocket messages
        }
      }

      this.ws.onerror = (error) => {
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        this.isConnected = false
        this.emit('disconnected')
        this.stopPing()
        this.attemptReconnect()
      }
    } catch {
      this.attemptReconnect()
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'metrics':
        this.emit('metrics', message.payload as MetricsData)
        break
      case 'containers':
        this.emit('containers', message.payload as ContainerData[])
        break
      case 'logs':
        this.emit('logs', message.payload as LogEntry)
        break
      case 'health':
        this.emit('health', message.payload)
        break
      case 'events':
        this.emit('events', message.payload)
        break
      case 'error':
        this.emit('error', message.payload)
        break
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000)
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max_reconnect_attempts')
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000,
    )

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  subscribe(topic: string): void {
    this.subscriptions.add(topic)
    if (this.isConnected) {
      this.send({
        type: 'subscribe',
        topic,
      })
    }
  }

  unsubscribe(topic: string): void {
    this.subscriptions.delete(topic)
    if (this.isConnected) {
      this.send({
        type: 'unsubscribe',
        topic,
      })
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopPing()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  onMetrics(callback: (data: MetricsData) => void): () => void {
    this.on('metrics', callback)
    this.subscribe('metrics')
    return () => {
      this.off('metrics', callback)
      this.unsubscribe('metrics')
    }
  }

  onContainers(callback: (data: ContainerData[]) => void): () => void {
    this.on('containers', callback)
    this.subscribe('containers')
    return () => {
      this.off('containers', callback)
      this.unsubscribe('containers')
    }
  }

  onLogs(callback: (data: LogEntry) => void): () => void {
    this.on('logs', callback)
    this.subscribe('logs')
    return () => {
      this.off('logs', callback)
      this.unsubscribe('logs')
    }
  }

  onHealth(callback: (data: any) => void): () => void {
    this.on('health', callback)
    this.subscribe('health')
    return () => {
      this.off('health', callback)
      this.unsubscribe('health')
    }
  }

  onConnection(callback: () => void): () => void {
    this.on('connected', callback)
    return () => {
      this.off('connected', callback)
    }
  }

  onDisconnection(callback: () => void): () => void {
    this.on('disconnected', callback)
    return () => {
      this.off('disconnected', callback)
    }
  }
}

let wsService: WebSocketService | null = null

export function getWebSocketService(): WebSocketService {
  if (!wsService && typeof window !== 'undefined') {
    wsService = new WebSocketService()
  }
  return wsService!
}

export default getWebSocketService
