/**
 * Global collector instances
 * Ensures singletons across all API routes
 */

import { DockerAPICollector } from './collectors/DockerAPICollector'

// Store instances in global scope
declare global {
  var __dockerCollector: DockerAPICollector | undefined
}

export function getGlobalDockerCollector(): DockerAPICollector {
  if (!global.__dockerCollector) {
    global.__dockerCollector = new DockerAPICollector()
  }
  return global.__dockerCollector
}
