import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Get list of nself containers
    const { stdout: containerList } = await execAsync("docker ps --format '{{.Names}}'")
    const nselfContainers = containerList.split('\n')
      .filter(name => name && (name.toLowerCase().startsWith('nself_') || name.toLowerCase().startsWith('nself-')))
    
    if (nselfContainers.length === 0) {
      return NextResponse.json({
        success: true,
        containers: []
      })
    }
    
    // Get network stats for each container from /proc/net/dev inside container
    const containerStats = await Promise.all(
      nselfContainers.map(async (containerName) => {
        try {
          // Get network stats from inside the container
          const { stdout } = await execAsync(
            `docker exec ${containerName} cat /proc/net/dev 2>/dev/null | grep -E 'eth0:|eth[0-9]:|ens[0-9]' | head -1`
          )
          
          // Parse the network stats line
          // Format: interface: rx_bytes rx_packets ... tx_bytes tx_packets ...
          const parts = stdout.trim().split(/\s+/)
          
          if (parts.length >= 10) {
            // rx_bytes is at index 1, tx_bytes is at index 9
            const rxBytes = parseInt(parts[1]) || 0
            const txBytes = parseInt(parts[9]) || 0
            
            return {
              name: containerName,
              rxBytes,
              txBytes
            }
          }
          
          return {
            name: containerName,
            rxBytes: 0,
            txBytes: 0
          }
        } catch (error: any) {
          return {
            name: containerName,
            rxBytes: 0,
            txBytes: 0
          }
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      containers: containerStats,
      timestamp: Date.now()
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to get Docker network statistics' },
      { status: 500 }
    )
  }
}