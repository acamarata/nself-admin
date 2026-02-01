// Workflow types for v0.7.0

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived'
export type WorkflowExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout'

export type TriggerType =
  | 'manual'
  | 'schedule'
  | 'webhook'
  | 'event'
  | 'api'
  | 'condition'
  | 'workflow'

export type ActionType =
  | 'http_request'
  | 'email'
  | 'notification'
  | 'slack'
  | 'database_query'
  | 'run_command'
  | 'transform_data'
  | 'condition'
  | 'loop'
  | 'delay'
  | 'parallel'
  | 'set_variable'
  | 'log'
  | 'error'
  | 'workflow'

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  name: string
  config: {
    // schedule
    cron?: string
    timezone?: string
    // webhook
    path?: string
    method?: string
    secret?: string
    // event
    eventType?: string
    eventSource?: string
    filter?: Record<string, unknown>
    // condition
    expression?: string
  }
  enabled: boolean
}

export interface WorkflowConnection {
  id: string
  sourceId: string
  sourcePort?: string
  targetId: string
  targetPort?: string
  condition?: string
}

export interface WorkflowAction {
  id: string
  type: ActionType
  name: string
  config: Record<string, unknown>
  position: { x: number; y: number }
  inputs?: WorkflowConnection[]
  outputs?: WorkflowConnection[]
  onError?: 'stop' | 'continue' | 'retry'
  retryConfig?: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier?: number
  }
  timeout?: number
}

export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  defaultValue?: unknown
  description?: string
  required?: boolean
}

export interface Workflow {
  id: string
  tenantId?: string
  name: string
  description?: string
  status: WorkflowStatus
  version: number
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
  connections: WorkflowConnection[]
  variables?: WorkflowVariable[]
  inputSchema?: Record<string, unknown>
  outputSchema?: Record<string, unknown>
  errorHandler?: WorkflowAction
  timeout?: number
  maxConcurrency?: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowExecutionStep {
  actionId: string
  actionName: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  input?: unknown
  output?: unknown
  error?: string
  startedAt?: string
  completedAt?: string
  duration?: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  workflowVersion: number
  status: WorkflowExecutionStatus
  triggerId?: string
  triggerType: TriggerType
  input?: unknown
  output?: unknown
  variables?: Record<string, unknown>
  steps: WorkflowExecutionStep[]
  error?: string
  startedAt: string
  completedAt?: string
  duration?: number
}

export interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  executionsByStatus: Record<WorkflowExecutionStatus, number>
  averageDuration: number
  successRate: number
  recentExecutions: WorkflowExecution[]
  topWorkflows: {
    workflow: Workflow
    executions: number
    successRate: number
  }[]
}

export interface ExecuteWorkflowInput {
  workflowId: string
  input?: unknown
  variables?: Record<string, unknown>
  async?: boolean
}
