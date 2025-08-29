/**
 * Global orchestrator instance
 * This ensures we have a single instance across all API routes and the app
 */

import { CollectionOrchestrator } from './CollectionOrchestrator'

// Store instance in global scope to survive HMR and multiple imports
declare global {
  var __orchestrator: CollectionOrchestrator | undefined
}

// Create or get the singleton instance
export function getGlobalOrchestrator(): CollectionOrchestrator {
  if (!global.__orchestrator) {
    global.__orchestrator = new CollectionOrchestrator()
  }
  return global.__orchestrator
}

// Export for convenience
export const orchestrator = getGlobalOrchestrator()