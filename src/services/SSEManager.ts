/**
 * SSE Manager
 * Manages Server-Sent Events connections and broadcasts updates
 */

import { NextResponse } from 'next/server'
import { orchestrator } from './globalOrchestrator'

export interface SSEClient {
  id: string
  controller: ReadableStreamDefaultController
  lastPing: number
}

export class SSEManager {
  private clients: Map<string, SSEClient> = new Map()
  private orchestrator = orchestrator
  private pingInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  /**
   * Initialize SSE manager
   */
  async initialize() {
    if (this.isInitialized) return
    
    
    // Start the orchestrator if not already running
    if (!this.orchestrator.isActive()) {
      await this.orchestrator.start()
    }
    
    // Remove all existing listeners to avoid duplicates
    this.orchestrator.removeAllListeners('stateUpdate')
    this.orchestrator.removeAllListeners('dockerEvent')
    this.orchestrator.removeAllListeners('serviceUpdate')
    
    // Listen for state updates
    this.orchestrator.on('stateUpdate', (state) => {
      this.broadcast({
        type: 'state',
        ...state  // Spread the state directly instead of nesting it
      })
    })
    
    // Listen for Docker events
    this.orchestrator.on('dockerEvent', (event) => {
      this.broadcast({
        type: 'dockerEvent',
        ...event
      })
    })
    
    // Listen for service updates
    this.orchestrator.on('serviceUpdate', (update) => {
      this.broadcast({
        type: 'serviceUpdate',
        ...update
      })
    })
    
    // Start ping interval to keep connections alive
    this.pingInterval = setInterval(() => {
      this.sendPing()
      this.cleanupStaleClients()
    }, 30000) // Every 30 seconds
    
    this.isInitialized = true
  }

  /**
   * Create SSE stream for a client
   */
  createStream(clientId: string): ReadableStream {
    
    const stream = new ReadableStream({
      start: async (controller) => {
        // Register client
        this.clients.set(clientId, {
          id: clientId,
          controller,
          lastPing: Date.now()
        })
        
        // Send initial state
        const initialState = this.orchestrator.getState()
        this.sendToClient(clientId, {
          type: 'initial',
          ...initialState  // Spread the state directly
        })
        
      },
      
      cancel: () => {
        // Client disconnected
        this.removeClient(clientId)
      }
    })
    
    return stream
  }

  /**
   * Send message to specific client
   */
  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId)
    if (!client) return
    
    try {
      const data = `data: ${JSON.stringify(message)}\n\n`
      const encoder = new TextEncoder()
      client.controller.enqueue(encoder.encode(data))
    } catch (error) {
      this.removeClient(clientId)
    }
  }

  /**
   * Broadcast message to all clients
   */
  private broadcast(message: any) {
    const deadClients: string[] = []
    
    for (const [clientId, client] of this.clients) {
      try {
        const data = `data: ${JSON.stringify(message)}\n\n`
        const encoder = new TextEncoder()
        client.controller.enqueue(encoder.encode(data))
      } catch (error) {
        deadClients.push(clientId)
      }
    }
    
    // Remove dead clients
    deadClients.forEach(id => this.removeClient(id))
  }

  /**
   * Send ping to keep connections alive
   */
  private sendPing() {
    this.broadcast({ type: 'ping', timestamp: Date.now() })
  }

  /**
   * Remove client
   */
  private removeClient(clientId: string) {
    const client = this.clients.get(clientId)
    if (client) {
      try {
        client.controller.close()
      } catch {
        // Ignore errors when closing
      }
      this.clients.delete(clientId)
    }
  }

  /**
   * Clean up stale clients
   */
  private cleanupStaleClients() {
    const now = Date.now()
    const staleTimeout = 60000 // 1 minute
    
    for (const [clientId, client] of this.clients) {
      if (now - client.lastPing > staleTimeout) {
        this.removeClient(clientId)
      }
    }
  }

  /**
   * Force refresh all data
   */
  async refresh() {
    await this.orchestrator.refresh()
  }

  /**
   * Get client count
   */
  getClientCount(): number {
    return this.clients.size
  }

  /**
   * Shutdown manager
   */
  async shutdown() {
    
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    
    // Close all client connections
    for (const clientId of this.clients.keys()) {
      this.removeClient(clientId)
    }
    
    // Stop orchestrator
    await this.orchestrator.stop()
    
    this.isInitialized = false
  }
}

// Singleton instance
let manager: SSEManager | null = null

export function getSSEManager(): SSEManager {
  if (!manager) {
    manager = new SSEManager()
  }
  return manager
}