import { exec } from 'child_process'
import Docker from 'dockerode'
import { createServer } from 'http'
import { NextRequest } from 'next/server'
import os from 'os'
import { Server } from 'socket.io'
import { promisify } from 'util'

const execAsync = promisify(exec)
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

let io: Server | null = null
let httpServer: any = null

interface Client {
  id: string
  subscriptions: Set<string>
}

const clients = new Map<string, Client>()

async function getSystemMetrics() {
  const cpus = os.cpus()
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const usedMemory = totalMemory - freeMemory

  const loadAvg = os.loadavg()
  const cpuUsage = (loadAvg[0] / cpus.length) * 100

  try {
    const { stdout: dfOutput } = await execAsync(
      "df -k / | tail -1 | awk '{print $3,$4}'",
    )
    const [usedDisk, availableDisk] = dfOutput.trim().split(' ').map(Number)
    const totalDisk = usedDisk + availableDisk

    return {
      cpu: {
        usage: Math.min(cpuUsage, 100),
        cores: cpus.length,
        processes: loadAvg[0],
      },
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100,
      },
      disk: {
        used: usedDisk * 1024,
        total: totalDisk * 1024,
        percentage: (usedDisk / totalDisk) * 100,
      },
      network: {
        rx: 0,
        tx: 0,
      },
    }
  } catch (error: any) {
    return {
      cpu: {
        usage: cpuUsage,
        cores: cpus.length,
        processes: loadAvg[0],
      },
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100,
      },
      disk: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      network: {
        rx: 0,
        tx: 0,
      },
    }
  }
}

async function getContainerStats() {
  try {
    const containers = await docker.listContainers({ all: true })
    const containerData = await Promise.all(
      containers.map(async (container) => {
        try {
          const stats = await docker
            .getContainer(container.Id)
            .stats({ stream: false })

          const cpuDelta =
            stats.cpu_stats.cpu_usage.total_usage -
            stats.precpu_stats.cpu_usage.total_usage
          const systemDelta =
            stats.cpu_stats.system_cpu_usage -
            stats.precpu_stats.system_cpu_usage
          const cpuPercent =
            (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100

          const memoryUsage = stats.memory_stats.usage || 0
          const memoryLimit = stats.memory_stats.limit || 1
          const memoryPercent = (memoryUsage / memoryLimit) * 100

          return {
            id: container.Id.substring(0, 12),
            name: container.Names[0].replace('/', ''),
            status: container.State.toLowerCase(),
            health: container.Status.includes('healthy')
              ? 'healthy'
              : container.Status.includes('unhealthy')
                ? 'unhealthy'
                : container.Status.includes('starting')
                  ? 'starting'
                  : undefined,
            cpu: cpuPercent,
            memory: memoryPercent,
            ports: container.Ports.map(
              (p) => `${p.PublicPort}:${p.PrivatePort}`,
            ).filter((p) => !p.includes('null')),
            uptime: Math.floor((Date.now() - container.Created * 1000) / 1000),
          }
        } catch (error: any) {
          return {
            id: container.Id.substring(0, 12),
            name: container.Names[0].replace('/', ''),
            status: container.State.toLowerCase(),
            health: undefined,
            cpu: 0,
            memory: 0,
            ports: container.Ports.map(
              (p) => `${p.PublicPort}:${p.PrivatePort}`,
            ).filter((p) => !p.includes('null')),
            uptime: Math.floor((Date.now() - container.Created * 1000) / 1000),
          }
        }
      }),
    )
    return containerData
  } catch (error: any) {
    return []
  }
}

function initializeWebSocket() {
  if (io) return io

  httpServer = createServer()
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    const client: Client = {
      id: socket.id,
      subscriptions: new Set(),
    }
    clients.set(socket.id, client)

    socket.on('subscribe', (topic: string) => {
      client.subscriptions.add(topic)
    })

    socket.on('unsubscribe', (topic: string) => {
      client.subscriptions.delete(topic)
    })

    socket.on('ping', () => {
      socket.emit('pong')
    })

    socket.on('disconnect', () => {
      clients.delete(socket.id)
    })
  })

  setInterval(async () => {
    const metrics = await getSystemMetrics()
    io?.emit('message', {
      type: 'metrics',
      payload: metrics,
      timestamp: Date.now(),
    })
  }, 5000)

  setInterval(async () => {
    const containers = await getContainerStats()
    io?.emit('message', {
      type: 'containers',
      payload: containers,
      timestamp: Date.now(),
    })
  }, 10000)

  httpServer.listen(3002, () => {})

  return io
}

export async function GET(request: NextRequest) {
  initializeWebSocket()

  return new Response(
    JSON.stringify({
      status: 'WebSocket server running',
      port: 3002,
      clients: clients.size,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.type === 'broadcast' && io) {
    io.emit('message', {
      type: body.topic || 'events',
      payload: body.data,
      timestamp: Date.now(),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Invalid request' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}
