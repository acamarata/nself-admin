export interface EnvVariable {
  key: string
  value: string
  defaultValue?: string
  isSecret?: boolean
  source?: 'env' | 'default' | 'override'
  category?: string
  hasChanges?: boolean
  description?: string
}

export type AccessRole = 'dev' | 'sr_dev' | 'lead_dev'

export interface EnvironmentTab {
  id: string
  label: string
  file: string
  description: string
  minRole: AccessRole
}
