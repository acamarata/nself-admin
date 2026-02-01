/**
 * Workflows Library
 *
 * Provides workflow management functionality including:
 * - Mock workflows and executions for development
 * - Action templates library
 * - CRUD operations for workflows
 * - Execution management
 */

import type {
  ActionType,
  ExecuteWorkflowInput,
  TriggerType,
  Workflow,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowStats,
  WorkflowStatus,
} from '@/types/workflow'

// ============================================================================
// Action Template Definitions
// ============================================================================

export interface ActionTemplate {
  type: ActionType
  name: string
  description: string
  icon: string
  category: 'communication' | 'data' | 'control' | 'integration' | 'utility'
  configSchema: {
    properties: Record<
      string,
      {
        type: string
        label: string
        description?: string
        required?: boolean
        default?: unknown
        options?: { label: string; value: string }[]
        placeholder?: string
      }
    >
  }
  inputPorts?: { id: string; name: string }[]
  outputPorts?: { id: string; name: string }[]
}

const actionTemplates: ActionTemplate[] = [
  {
    type: 'http_request',
    name: 'HTTP Request',
    description: 'Make an HTTP request to an external API or service',
    icon: 'Globe',
    category: 'integration',
    configSchema: {
      properties: {
        method: {
          type: 'select',
          label: 'Method',
          required: true,
          default: 'GET',
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' },
          ],
        },
        url: {
          type: 'string',
          label: 'URL',
          required: true,
          placeholder: 'https://api.example.com/endpoint',
        },
        headers: {
          type: 'json',
          label: 'Headers',
          description: 'Request headers as JSON object',
          default: {},
        },
        body: {
          type: 'json',
          label: 'Body',
          description: 'Request body (for POST, PUT, PATCH)',
        },
        timeout: {
          type: 'number',
          label: 'Timeout (ms)',
          default: 30000,
        },
      },
    },
    outputPorts: [
      { id: 'success', name: 'Success' },
      { id: 'error', name: 'Error' },
    ],
  },
  {
    type: 'email',
    name: 'Send Email',
    description: 'Send an email using the configured email service',
    icon: 'Mail',
    category: 'communication',
    configSchema: {
      properties: {
        to: {
          type: 'string',
          label: 'To',
          required: true,
          placeholder: 'recipient@example.com',
        },
        cc: {
          type: 'string',
          label: 'CC',
          placeholder: 'cc@example.com',
        },
        bcc: {
          type: 'string',
          label: 'BCC',
          placeholder: 'bcc@example.com',
        },
        subject: {
          type: 'string',
          label: 'Subject',
          required: true,
        },
        body: {
          type: 'text',
          label: 'Body',
          required: true,
        },
        isHtml: {
          type: 'boolean',
          label: 'HTML Email',
          default: false,
        },
      },
    },
  },
  {
    type: 'notification',
    name: 'Send Notification',
    description: 'Send an in-app notification or push notification',
    icon: 'Bell',
    category: 'communication',
    configSchema: {
      properties: {
        type: {
          type: 'select',
          label: 'Notification Type',
          required: true,
          default: 'info',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
          ],
        },
        title: {
          type: 'string',
          label: 'Title',
          required: true,
        },
        message: {
          type: 'text',
          label: 'Message',
          required: true,
        },
        channel: {
          type: 'select',
          label: 'Channel',
          default: 'app',
          options: [
            { label: 'In-App', value: 'app' },
            { label: 'Push', value: 'push' },
            { label: 'Both', value: 'both' },
          ],
        },
        targetUsers: {
          type: 'string',
          label: 'Target Users',
          description: 'Comma-separated user IDs or "all"',
          default: 'all',
        },
      },
    },
  },
  {
    type: 'database_query',
    name: 'Database Query',
    description: 'Execute a database query via Hasura or direct PostgreSQL',
    icon: 'Database',
    category: 'data',
    configSchema: {
      properties: {
        queryType: {
          type: 'select',
          label: 'Query Type',
          required: true,
          default: 'graphql',
          options: [
            { label: 'GraphQL', value: 'graphql' },
            { label: 'SQL', value: 'sql' },
          ],
        },
        query: {
          type: 'code',
          label: 'Query',
          required: true,
          placeholder: 'query { users { id name } }',
        },
        variables: {
          type: 'json',
          label: 'Variables',
          default: {},
        },
        connection: {
          type: 'select',
          label: 'Connection',
          default: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Read Replica', value: 'replica' },
          ],
        },
      },
    },
  },
  {
    type: 'run_command',
    name: 'Run CLI Command',
    description: 'Execute an nself CLI command or shell command',
    icon: 'Terminal',
    category: 'utility',
    configSchema: {
      properties: {
        command: {
          type: 'string',
          label: 'Command',
          required: true,
          placeholder: 'nself db backup',
        },
        workingDirectory: {
          type: 'string',
          label: 'Working Directory',
          placeholder: '/workspace',
        },
        timeout: {
          type: 'number',
          label: 'Timeout (ms)',
          default: 60000,
        },
        captureOutput: {
          type: 'boolean',
          label: 'Capture Output',
          default: true,
        },
      },
    },
  },
  {
    type: 'delay',
    name: 'Delay / Wait',
    description: 'Pause workflow execution for a specified duration',
    icon: 'Clock',
    category: 'control',
    configSchema: {
      properties: {
        duration: {
          type: 'number',
          label: 'Duration (ms)',
          required: true,
          default: 1000,
        },
        unit: {
          type: 'select',
          label: 'Unit',
          default: 'ms',
          options: [
            { label: 'Milliseconds', value: 'ms' },
            { label: 'Seconds', value: 's' },
            { label: 'Minutes', value: 'm' },
            { label: 'Hours', value: 'h' },
          ],
        },
      },
    },
  },
  {
    type: 'condition',
    name: 'Condition (If/Else)',
    description: 'Branch workflow based on a condition',
    icon: 'GitBranch',
    category: 'control',
    configSchema: {
      properties: {
        expression: {
          type: 'string',
          label: 'Condition Expression',
          required: true,
          placeholder: '{{previousStep.status}} === "success"',
          description: 'JavaScript expression that evaluates to true or false',
        },
        trueLabel: {
          type: 'string',
          label: 'True Branch Label',
          default: 'Yes',
        },
        falseLabel: {
          type: 'string',
          label: 'False Branch Label',
          default: 'No',
        },
      },
    },
    outputPorts: [
      { id: 'true', name: 'True' },
      { id: 'false', name: 'False' },
    ],
  },
  {
    type: 'loop',
    name: 'Loop',
    description:
      'Iterate over an array or repeat actions a specified number of times',
    icon: 'Repeat',
    category: 'control',
    configSchema: {
      properties: {
        loopType: {
          type: 'select',
          label: 'Loop Type',
          required: true,
          default: 'forEach',
          options: [
            { label: 'For Each', value: 'forEach' },
            { label: 'While', value: 'while' },
            { label: 'Count', value: 'count' },
          ],
        },
        source: {
          type: 'string',
          label: 'Source Array',
          placeholder: '{{previousStep.output.items}}',
          description: 'For "For Each" loops',
        },
        condition: {
          type: 'string',
          label: 'While Condition',
          placeholder: '{{index}} < 10',
          description: 'For "While" loops',
        },
        count: {
          type: 'number',
          label: 'Iterations',
          default: 10,
          description: 'For "Count" loops',
        },
        maxIterations: {
          type: 'number',
          label: 'Max Iterations',
          default: 100,
          description: 'Safety limit to prevent infinite loops',
        },
      },
    },
    outputPorts: [
      { id: 'iteration', name: 'Each Iteration' },
      { id: 'complete', name: 'Loop Complete' },
    ],
  },
  {
    type: 'transform_data',
    name: 'Transform Data',
    description: 'Transform, map, or filter data from previous steps',
    icon: 'Shuffle',
    category: 'data',
    configSchema: {
      properties: {
        transformType: {
          type: 'select',
          label: 'Transform Type',
          required: true,
          default: 'map',
          options: [
            { label: 'Map', value: 'map' },
            { label: 'Filter', value: 'filter' },
            { label: 'Reduce', value: 'reduce' },
            { label: 'Custom', value: 'custom' },
          ],
        },
        input: {
          type: 'string',
          label: 'Input Data',
          required: true,
          placeholder: '{{previousStep.output}}',
        },
        expression: {
          type: 'code',
          label: 'Transform Expression',
          required: true,
          placeholder:
            'item => ({ id: item.id, name: item.name.toUpperCase() })',
        },
        outputKey: {
          type: 'string',
          label: 'Output Variable Name',
          default: 'transformedData',
        },
      },
    },
  },
  {
    type: 'set_variable',
    name: 'Set Variable',
    description: 'Set or update a workflow variable',
    icon: 'Variable',
    category: 'utility',
    configSchema: {
      properties: {
        name: {
          type: 'string',
          label: 'Variable Name',
          required: true,
          placeholder: 'myVariable',
        },
        value: {
          type: 'string',
          label: 'Value',
          required: true,
          placeholder: '{{previousStep.output.value}}',
        },
        valueType: {
          type: 'select',
          label: 'Value Type',
          default: 'auto',
          options: [
            { label: 'Auto-detect', value: 'auto' },
            { label: 'String', value: 'string' },
            { label: 'Number', value: 'number' },
            { label: 'Boolean', value: 'boolean' },
            { label: 'JSON Object', value: 'object' },
            { label: 'Array', value: 'array' },
          ],
        },
        scope: {
          type: 'select',
          label: 'Scope',
          default: 'workflow',
          options: [
            { label: 'Workflow', value: 'workflow' },
            { label: 'Step', value: 'step' },
          ],
        },
      },
    },
  },
]

// ============================================================================
// Mock Data
// ============================================================================

const mockWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Daily Backup Notification',
    description: 'Sends notification after daily backup completes',
    status: 'active',
    version: 1,
    triggers: [
      {
        id: 'tr-1',
        type: 'schedule',
        name: 'Daily at 2 AM',
        config: { cron: '0 2 * * *', timezone: 'UTC' },
        enabled: true,
      },
    ],
    actions: [
      {
        id: 'act-1',
        type: 'run_command',
        name: 'Run Backup',
        config: { command: 'nself db backup', captureOutput: true },
        position: { x: 100, y: 100 },
        onError: 'stop',
        timeout: 300000,
      },
      {
        id: 'act-2',
        type: 'notification',
        name: 'Send Alert',
        config: {
          type: 'success',
          title: 'Backup Complete',
          message: 'Daily database backup completed successfully.',
        },
        position: { x: 300, y: 100 },
      },
    ],
    connections: [{ id: 'c-1', sourceId: 'act-1', targetId: 'act-2' }],
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'wf-2',
    name: 'New User Welcome Flow',
    description:
      'Sends welcome email and creates initial user data when a new user signs up',
    status: 'active',
    version: 2,
    triggers: [
      {
        id: 'tr-2',
        type: 'event',
        name: 'User Created',
        config: { eventType: 'user.created', eventSource: 'auth' },
        enabled: true,
      },
    ],
    actions: [
      {
        id: 'act-3',
        type: 'set_variable',
        name: 'Extract User Data',
        config: {
          name: 'userName',
          value: '{{trigger.data.user.name}}',
          valueType: 'string',
        },
        position: { x: 100, y: 100 },
      },
      {
        id: 'act-4',
        type: 'email',
        name: 'Send Welcome Email',
        config: {
          to: '{{trigger.data.user.email}}',
          subject: 'Welcome to our platform!',
          body: 'Hello {{userName}}, welcome to our platform!',
          isHtml: false,
        },
        position: { x: 300, y: 100 },
        onError: 'continue',
      },
      {
        id: 'act-5',
        type: 'database_query',
        name: 'Create User Profile',
        config: {
          queryType: 'graphql',
          query:
            'mutation CreateProfile($userId: uuid!) { insert_profiles_one(object: {user_id: $userId, created_at: "now()"}) { id } }',
          variables: { userId: '{{trigger.data.user.id}}' },
        },
        position: { x: 500, y: 100 },
      },
      {
        id: 'act-6',
        type: 'notification',
        name: 'Notify Admins',
        config: {
          type: 'info',
          title: 'New User',
          message: 'New user {{userName}} has signed up.',
          targetUsers: 'admins',
        },
        position: { x: 700, y: 100 },
      },
    ],
    connections: [
      { id: 'c-2', sourceId: 'act-3', targetId: 'act-4' },
      { id: 'c-3', sourceId: 'act-4', targetId: 'act-5' },
      { id: 'c-4', sourceId: 'act-5', targetId: 'act-6' },
    ],
    variables: [
      { name: 'userName', type: 'string', description: 'The new user name' },
    ],
    createdBy: 'admin',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'wf-3',
    name: 'Health Check Monitor',
    description: 'Monitors service health and alerts on failures',
    status: 'paused',
    version: 1,
    triggers: [
      {
        id: 'tr-3',
        type: 'schedule',
        name: 'Every 5 Minutes',
        config: { cron: '*/5 * * * *', timezone: 'UTC' },
        enabled: true,
      },
    ],
    actions: [
      {
        id: 'act-7',
        type: 'http_request',
        name: 'Check API Health',
        config: {
          method: 'GET',
          url: 'http://localhost:3000/api/health',
          timeout: 5000,
        },
        position: { x: 100, y: 100 },
        onError: 'continue',
      },
      {
        id: 'act-8',
        type: 'condition',
        name: 'Is Healthy?',
        config: {
          expression: '{{act-7.output.status}} === 200',
          trueLabel: 'Healthy',
          falseLabel: 'Unhealthy',
        },
        position: { x: 300, y: 100 },
      },
      {
        id: 'act-9',
        type: 'notification',
        name: 'Alert on Failure',
        config: {
          type: 'error',
          title: 'Service Down',
          message: 'API health check failed!',
          channel: 'both',
        },
        position: { x: 500, y: 200 },
      },
      {
        id: 'act-10',
        type: 'run_command',
        name: 'Attempt Recovery',
        config: { command: 'nself restart api', timeout: 30000 },
        position: { x: 700, y: 200 },
      },
    ],
    connections: [
      { id: 'c-5', sourceId: 'act-7', targetId: 'act-8' },
      { id: 'c-6', sourceId: 'act-8', sourcePort: 'false', targetId: 'act-9' },
      { id: 'c-7', sourceId: 'act-9', targetId: 'act-10' },
    ],
    createdBy: 'admin',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
  },
]

const mockExecutions: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflowId: 'wf-1',
    workflowVersion: 1,
    status: 'completed',
    triggerType: 'schedule',
    triggerId: 'tr-1',
    input: {},
    output: { backupFile: '/backups/db-2026-01-31.sql.gz', size: '245MB' },
    steps: [
      {
        actionId: 'act-1',
        actionName: 'Run Backup',
        status: 'completed',
        input: { command: 'nself db backup' },
        output: { backupFile: '/backups/db-2026-01-31.sql.gz', size: '245MB' },
        startedAt: '2026-01-31T02:00:00Z',
        completedAt: '2026-01-31T02:05:23Z',
        duration: 323000,
      },
      {
        actionId: 'act-2',
        actionName: 'Send Alert',
        status: 'completed',
        input: { type: 'success', title: 'Backup Complete' },
        output: { sent: true },
        startedAt: '2026-01-31T02:05:23Z',
        completedAt: '2026-01-31T02:05:24Z',
        duration: 1000,
      },
    ],
    startedAt: '2026-01-31T02:00:00Z',
    completedAt: '2026-01-31T02:05:24Z',
    duration: 324000,
  },
  {
    id: 'exec-2',
    workflowId: 'wf-2',
    workflowVersion: 2,
    status: 'completed',
    triggerType: 'event',
    triggerId: 'tr-2',
    input: {
      user: { id: 'user-123', name: 'John Doe', email: 'john@example.com' },
    },
    variables: { userName: 'John Doe' },
    output: { profileId: 'profile-456' },
    steps: [
      {
        actionId: 'act-3',
        actionName: 'Extract User Data',
        status: 'completed',
        output: { userName: 'John Doe' },
        startedAt: '2026-01-30T10:15:00Z',
        completedAt: '2026-01-30T10:15:00Z',
        duration: 10,
      },
      {
        actionId: 'act-4',
        actionName: 'Send Welcome Email',
        status: 'completed',
        output: { messageId: 'msg-789' },
        startedAt: '2026-01-30T10:15:00Z',
        completedAt: '2026-01-30T10:15:02Z',
        duration: 2000,
      },
      {
        actionId: 'act-5',
        actionName: 'Create User Profile',
        status: 'completed',
        output: { profileId: 'profile-456' },
        startedAt: '2026-01-30T10:15:02Z',
        completedAt: '2026-01-30T10:15:03Z',
        duration: 1000,
      },
      {
        actionId: 'act-6',
        actionName: 'Notify Admins',
        status: 'completed',
        output: { sent: true },
        startedAt: '2026-01-30T10:15:03Z',
        completedAt: '2026-01-30T10:15:03Z',
        duration: 500,
      },
    ],
    startedAt: '2026-01-30T10:15:00Z',
    completedAt: '2026-01-30T10:15:03Z',
    duration: 3510,
  },
  {
    id: 'exec-3',
    workflowId: 'wf-1',
    workflowVersion: 1,
    status: 'failed',
    triggerType: 'schedule',
    triggerId: 'tr-1',
    input: {},
    error: 'Backup failed: Insufficient disk space',
    steps: [
      {
        actionId: 'act-1',
        actionName: 'Run Backup',
        status: 'failed',
        input: { command: 'nself db backup' },
        error: 'Insufficient disk space',
        startedAt: '2026-01-30T02:00:00Z',
        completedAt: '2026-01-30T02:00:45Z',
        duration: 45000,
      },
      {
        actionId: 'act-2',
        actionName: 'Send Alert',
        status: 'skipped',
      },
    ],
    startedAt: '2026-01-30T02:00:00Z',
    completedAt: '2026-01-30T02:00:45Z',
    duration: 45000,
  },
  {
    id: 'exec-4',
    workflowId: 'wf-1',
    workflowVersion: 1,
    status: 'running',
    triggerType: 'manual',
    input: {},
    steps: [
      {
        actionId: 'act-1',
        actionName: 'Run Backup',
        status: 'running',
        input: { command: 'nself db backup' },
        startedAt: '2026-02-01T14:30:00Z',
      },
      {
        actionId: 'act-2',
        actionName: 'Send Alert',
        status: 'pending',
      },
    ],
    startedAt: '2026-02-01T14:30:00Z',
  },
]

// In-memory storage (would be replaced with database in production)
let workflows = [...mockWorkflows]
let executions = [...mockExecutions]

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

// ============================================================================
// Workflow CRUD Operations
// ============================================================================

export interface GetWorkflowsOptions {
  tenantId?: string
  status?: WorkflowStatus
  limit?: number
  offset?: number
}

export async function getWorkflows(
  options: GetWorkflowsOptions = {},
): Promise<Workflow[]> {
  let result = [...workflows]

  if (options.tenantId) {
    result = result.filter((w) => w.tenantId === options.tenantId)
  }

  if (options.status) {
    result = result.filter((w) => w.status === options.status)
  }

  // Apply pagination
  const offset = options.offset || 0
  const limit = options.limit || 100
  result = result.slice(offset, offset + limit)

  return result
}

export async function getWorkflowById(id: string): Promise<Workflow | null> {
  return workflows.find((w) => w.id === id) || null
}

export interface CreateWorkflowInput {
  name: string
  description?: string
  tenantId?: string
  triggers?: Workflow['triggers']
  actions?: Workflow['actions']
  connections?: Workflow['connections']
  variables?: Workflow['variables']
  inputSchema?: Workflow['inputSchema']
  outputSchema?: Workflow['outputSchema']
  timeout?: number
  maxConcurrency?: number
  createdBy: string
}

export async function createWorkflow(
  input: CreateWorkflowInput,
): Promise<Workflow> {
  const now = getCurrentTimestamp()
  const workflow: Workflow = {
    id: generateId('wf'),
    name: input.name,
    description: input.description,
    tenantId: input.tenantId,
    status: 'draft',
    version: 1,
    triggers: input.triggers || [],
    actions: input.actions || [],
    connections: input.connections || [],
    variables: input.variables,
    inputSchema: input.inputSchema,
    outputSchema: input.outputSchema,
    timeout: input.timeout,
    maxConcurrency: input.maxConcurrency,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  }

  workflows.push(workflow)
  return workflow
}

export interface UpdateWorkflowInput {
  name?: string
  description?: string
  triggers?: Workflow['triggers']
  actions?: Workflow['actions']
  connections?: Workflow['connections']
  variables?: Workflow['variables']
  inputSchema?: Workflow['inputSchema']
  outputSchema?: Workflow['outputSchema']
  timeout?: number
  maxConcurrency?: number
}

export async function updateWorkflow(
  id: string,
  updates: UpdateWorkflowInput,
): Promise<Workflow | null> {
  const index = workflows.findIndex((w) => w.id === id)
  if (index === -1) return null

  const workflow = workflows[index]

  // Increment version if structure changes
  const structureChanged =
    updates.triggers !== undefined ||
    updates.actions !== undefined ||
    updates.connections !== undefined

  workflows[index] = {
    ...workflow,
    ...updates,
    version: structureChanged ? workflow.version + 1 : workflow.version,
    updatedAt: getCurrentTimestamp(),
  }

  return workflows[index]
}

export async function deleteWorkflow(id: string): Promise<boolean> {
  const index = workflows.findIndex((w) => w.id === id)
  if (index === -1) return false

  workflows.splice(index, 1)
  // Also delete related executions
  executions = executions.filter((e) => e.workflowId !== id)
  return true
}

export async function activateWorkflow(id: string): Promise<Workflow | null> {
  const index = workflows.findIndex((w) => w.id === id)
  if (index === -1) return null

  const workflow = workflows[index]

  // Validate workflow before activation
  if (workflow.triggers.length === 0) {
    throw new Error('Workflow must have at least one trigger to be activated')
  }
  if (workflow.actions.length === 0) {
    throw new Error('Workflow must have at least one action to be activated')
  }

  workflows[index] = {
    ...workflow,
    status: 'active',
    updatedAt: getCurrentTimestamp(),
  }

  return workflows[index]
}

export async function pauseWorkflow(id: string): Promise<Workflow | null> {
  const index = workflows.findIndex((w) => w.id === id)
  if (index === -1) return null

  workflows[index] = {
    ...workflows[index],
    status: 'paused',
    updatedAt: getCurrentTimestamp(),
  }

  return workflows[index]
}

export interface DuplicateWorkflowInput {
  name?: string
  createdBy: string
}

export async function duplicateWorkflow(
  id: string,
  input: DuplicateWorkflowInput,
): Promise<Workflow | null> {
  const original = await getWorkflowById(id)
  if (!original) return null

  const now = getCurrentTimestamp()
  const duplicatedWorkflow: Workflow = {
    id: generateId('wf'),
    name: input.name || `${original.name} (Copy)`,
    description: original.description,
    tenantId: original.tenantId,
    status: 'draft',
    version: 1,
    triggers: original.triggers.map((trigger) => ({
      ...trigger,
      id: generateId('tr'),
    })),
    actions: original.actions.map((action) => ({
      ...action,
      id: generateId('act'),
    })),
    connections: [], // Connections need to be remapped after actions are duplicated
    variables: original.variables ? [...original.variables] : undefined,
    inputSchema: original.inputSchema,
    outputSchema: original.outputSchema,
    timeout: original.timeout,
    maxConcurrency: original.maxConcurrency,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  }

  // Remap connections to use new action IDs
  const actionIdMap = new Map<string, string>()
  original.actions.forEach((action, index) => {
    actionIdMap.set(action.id, duplicatedWorkflow.actions[index].id)
  })

  duplicatedWorkflow.connections = original.connections.map((conn) => ({
    ...conn,
    id: generateId('c'),
    sourceId: actionIdMap.get(conn.sourceId) || conn.sourceId,
    targetId: actionIdMap.get(conn.targetId) || conn.targetId,
  }))

  workflows.push(duplicatedWorkflow)
  return duplicatedWorkflow
}

// ============================================================================
// Workflow Execution Operations
// ============================================================================

export async function executeWorkflow(
  input: ExecuteWorkflowInput,
): Promise<WorkflowExecution> {
  const workflow = await getWorkflowById(input.workflowId)
  if (!workflow) {
    throw new Error(`Workflow not found: ${input.workflowId}`)
  }

  if (workflow.status !== 'active') {
    throw new Error(`Workflow is not active: ${workflow.status}`)
  }

  const now = getCurrentTimestamp()
  const execution: WorkflowExecution = {
    id: generateId('exec'),
    workflowId: workflow.id,
    workflowVersion: workflow.version,
    status: input.async ? 'pending' : 'running',
    triggerType: 'manual',
    input: input.input,
    variables: input.variables,
    steps: workflow.actions.map((action) => ({
      actionId: action.id,
      actionName: action.name,
      status: 'pending',
    })),
    startedAt: now,
  }

  executions.push(execution)

  // In a real implementation, this would trigger actual execution
  // For mock purposes, we simulate async execution
  if (!input.async) {
    // Simulate synchronous execution (immediate completion)
    setTimeout(() => {
      const idx = executions.findIndex((e) => e.id === execution.id)
      if (idx !== -1) {
        executions[idx] = {
          ...executions[idx],
          status: 'completed',
          completedAt: getCurrentTimestamp(),
          duration: 5000,
          steps: executions[idx].steps.map((step) => ({
            ...step,
            status: 'completed',
            startedAt: now,
            completedAt: getCurrentTimestamp(),
            duration: 1000,
          })),
        }
      }
    }, 100)
  }

  return execution
}

export interface GetExecutionsOptions {
  workflowId?: string
  status?: WorkflowExecutionStatus
  limit?: number
  offset?: number
  orderBy?: 'startedAt' | 'completedAt'
  orderDir?: 'asc' | 'desc'
}

export async function getWorkflowExecutions(
  options: GetExecutionsOptions = {},
): Promise<WorkflowExecution[]> {
  let result = [...executions]

  if (options.workflowId) {
    result = result.filter((e) => e.workflowId === options.workflowId)
  }

  if (options.status) {
    result = result.filter((e) => e.status === options.status)
  }

  // Sort
  const orderBy = options.orderBy || 'startedAt'
  const orderDir = options.orderDir || 'desc'
  result.sort((a, b) => {
    const aVal = a[orderBy] || ''
    const bVal = b[orderBy] || ''
    return orderDir === 'desc'
      ? bVal.localeCompare(aVal)
      : aVal.localeCompare(bVal)
  })

  // Apply pagination
  const offset = options.offset || 0
  const limit = options.limit || 100
  result = result.slice(offset, offset + limit)

  return result
}

export async function getWorkflowExecution(
  executionId: string,
): Promise<WorkflowExecution | null> {
  return executions.find((e) => e.id === executionId) || null
}

export async function cancelExecution(
  executionId: string,
): Promise<WorkflowExecution | null> {
  const index = executions.findIndex((e) => e.id === executionId)
  if (index === -1) return null

  const execution = executions[index]
  if (execution.status !== 'running' && execution.status !== 'pending') {
    throw new Error(`Cannot cancel execution with status: ${execution.status}`)
  }

  executions[index] = {
    ...execution,
    status: 'cancelled',
    completedAt: getCurrentTimestamp(),
    steps: execution.steps.map((step) => ({
      ...step,
      status:
        step.status === 'running' || step.status === 'pending'
          ? 'skipped'
          : step.status,
    })),
  }

  return executions[index]
}

// ============================================================================
// Statistics
// ============================================================================

export async function getWorkflowStats(): Promise<WorkflowStats> {
  const totalWorkflows = workflows.length
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length
  const totalExecutions = executions.length

  // Count executions by status
  const executionsByStatus: Record<WorkflowExecutionStatus, number> = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    timeout: 0,
  }
  executions.forEach((e) => {
    executionsByStatus[e.status]++
  })

  // Calculate average duration (only for completed executions)
  const completedExecutions = executions.filter(
    (e) => e.status === 'completed' && e.duration,
  )
  const averageDuration =
    completedExecutions.length > 0
      ? completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) /
        completedExecutions.length
      : 0

  // Calculate success rate
  const finishedExecutions = executions.filter((e) =>
    ['completed', 'failed', 'cancelled', 'timeout'].includes(e.status),
  )
  const successRate =
    finishedExecutions.length > 0
      ? (executionsByStatus.completed / finishedExecutions.length) * 100
      : 0

  // Recent executions (last 10)
  const recentExecutions = [...executions]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 10)

  // Top workflows by execution count
  const workflowExecutionCounts: Record<
    string,
    { count: number; successful: number }
  > = {}
  executions.forEach((e) => {
    if (!workflowExecutionCounts[e.workflowId]) {
      workflowExecutionCounts[e.workflowId] = { count: 0, successful: 0 }
    }
    workflowExecutionCounts[e.workflowId].count++
    if (e.status === 'completed') {
      workflowExecutionCounts[e.workflowId].successful++
    }
  })

  const topWorkflows = workflows
    .map((workflow) => {
      const stats = workflowExecutionCounts[workflow.id] || {
        count: 0,
        successful: 0,
      }
      return {
        workflow,
        executions: stats.count,
        successRate:
          stats.count > 0 ? (stats.successful / stats.count) * 100 : 0,
      }
    })
    .sort((a, b) => b.executions - a.executions)
    .slice(0, 5)

  return {
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    executionsByStatus,
    averageDuration,
    successRate,
    recentExecutions,
    topWorkflows,
  }
}

// ============================================================================
// Action Templates
// ============================================================================

export async function getActionTemplates(): Promise<ActionTemplate[]> {
  return actionTemplates
}

export function getActionTemplateByType(
  type: ActionType,
): ActionTemplate | undefined {
  return actionTemplates.find((t) => t.type === type)
}

export function getActionTemplatesByCategory(
  category: ActionTemplate['category'],
): ActionTemplate[] {
  return actionTemplates.filter((t) => t.category === category)
}

// ============================================================================
// Trigger Helpers
// ============================================================================

export function getTriggerTypeLabel(type: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    manual: 'Manual',
    schedule: 'Schedule',
    webhook: 'Webhook',
    event: 'Event',
    api: 'API',
    condition: 'Condition',
    workflow: 'Workflow',
  }
  return labels[type]
}

export function getActionTypeLabel(type: ActionType): string {
  const template = actionTemplates.find((t) => t.type === type)
  return template?.name || type
}

// ActionTemplate is already exported at definition
