export interface NavGroup {
  title: string
  collapsed?: boolean
  position?: 'top' | 'bottom'
  links: Array<{
    title: string
    href: string
    icon?: string
    badge?: string | { text: string; color: string }
    description?: string
    external?: boolean
    status?: 'running' | 'stopped' | 'error' | 'healthy' | 'unhealthy'
    submenu?: Array<{
      label?: string
      href?: string
      status?: 'running' | 'stopped' | 'error'
      separator?: boolean
      external?: boolean
    }>
  }>
}

export const navigation: Array<NavGroup> = [
  {
    title: 'Overview',
    links: [
      { 
        title: 'Dashboard', 
        href: '/', 
        icon: 'layout-dashboard',
        description: 'System overview and metrics'
      },
      { 
        title: 'Config', 
        href: '/config',
        icon: 'settings',
        badge: { text: '3', color: 'yellow' },
        description: 'System configuration and settings',
        submenu: [
          { label: 'Environment Variables', href: '/config/env' },
          { label: 'Secrets Management', href: '/config/secrets' },
          { label: 'Domain Configuration', href: '/config/domains' },
          { label: 'SSL/TLS Certificates', href: '/config/ssl' },
          { label: 'CORS Settings', href: '/config/cors' },
          { label: 'Rate Limiting', href: '/config/rate-limits' },
          { label: 'Email Configuration', href: '/config/email' },
          { label: 'Authentication Settings', href: '/config/auth' }
        ]
      },
      { 
        title: 'Services', 
        href: '/services',
        icon: 'box',
        badge: '20',
        description: 'Service management and monitoring',
        submenu: [
          { label: 'All Services', href: '/services' },
          { label: 'Service Health Matrix', href: '/services/health' },
          { label: 'Service Dependencies', href: '/services/dependencies' }
        ]
      },
      { 
        title: 'Database', 
        href: '/database',
        icon: 'database',
        description: 'Database management tools',
        submenu: [
          { label: 'SQL Console', href: '/database/sql' },
          { label: 'Schema Designer', href: '/database/schema' },
          { label: 'Query Builder', href: '/database/query' },
          { label: 'Performance Insights', href: '/database/performance' }
        ]
      },
      { 
        title: 'Backups', 
        href: '/backups',
        icon: 'archive',
        description: 'Backup and restore management',
        submenu: [
          { label: 'Backup Management', href: '/backups' },
          { label: 'Scheduled Backups', href: '/backups/scheduled' },
          { label: 'Restore Points', href: '/backups/restore' },
          { label: 'Export/Import', href: '/backups/export' }
        ]
      },
      { 
        title: 'Monitor', 
        href: '/monitor',
        icon: 'activity',
        description: 'System monitoring and alerts',
        submenu: [
          { label: 'Real-time Metrics', href: '/monitor/metrics' },
          { label: 'Health Dashboard', href: '/monitor/health' },
          { label: 'Alerts & Notifications', href: '/monitor/alerts' },
          { label: 'Log Aggregation', href: '/monitor/logs' },
          { label: 'Performance Tracking', href: '/monitor/performance' }
        ]
      },
      { 
        title: 'Doctor', 
        href: '/doctor',
        icon: 'heart-pulse',
        description: 'System diagnostics and health',
        submenu: [
          { label: 'System Diagnostics', href: '/doctor/diagnostics' },
          { label: 'Health Checks', href: '/doctor/health' },
          { label: 'Configuration Validation', href: '/doctor/validate' },
          { label: 'Troubleshooting Guide', href: '/doctor/troubleshoot' }
        ]
      }
    ]
  },
  {
    title: 'Services',
    links: [
      { 
        title: 'PostgreSQL', 
        href: '/services/postgresql',
        icon: 'database',
        status: 'running',
        description: 'PostgreSQL database service',
        submenu: [
          { label: 'Database Management', href: '/services/postgresql' },
          { label: 'Query Console', href: '/services/postgresql/query' },
          { label: 'Performance Tuning', href: '/services/postgresql/performance' },
          { label: 'Replication Status', href: '/services/postgresql/replication' },
          { label: 'Connection Pools', href: '/services/postgresql/connections' }
        ]
      },
      { 
        title: 'Hasura', 
        href: '/services/hasura',
        icon: 'git-branch',
        status: 'running',
        description: 'Hasura GraphQL Engine',
        submenu: [
          { label: 'GraphQL Console', href: '/services/hasura/console' },
          { label: 'Schema Management', href: '/services/hasura/schema' },
          { label: 'Permissions', href: '/services/hasura/permissions' },
          { label: 'Event Triggers', href: '/services/hasura/events' },
          { label: 'Actions & Remote Schemas', href: '/services/hasura/actions' },
          { label: 'Metadata Management', href: '/services/hasura/metadata' }
        ]
      },
      { 
        title: 'Auth Service', 
        href: '/services/auth',
        icon: 'shield',
        status: 'running',
        description: 'Authentication and authorization',
        submenu: [
          { label: 'User Management', href: '/services/auth/users' },
          { label: 'Roles & Permissions', href: '/services/auth/roles' },
          { label: 'OAuth Providers', href: '/services/auth/oauth' },
          { label: 'JWT Configuration', href: '/services/auth/jwt' },
          { label: 'Session Management', href: '/services/auth/sessions' }
        ]
      },
      { 
        title: 'Functions', 
        href: '/services/functions',
        icon: 'function',
        description: 'Serverless functions',
        submenu: [
          { label: 'Function Editor', href: '/services/functions/editor' },
          { label: 'Deployment', href: '/services/functions/deploy' },
          { label: 'Logs & Monitoring', href: '/services/functions/logs' },
          { label: 'Environment Variables', href: '/services/functions/env' },
          { label: 'Triggers & Scheduling', href: '/services/functions/triggers' }
        ]
      },
      { 
        title: 'Storage (MinIO)', 
        href: '/services/storage',
        icon: 'hard-drive',
        status: 'running',
        description: 'Object storage service',
        submenu: [
          { label: 'Bucket Management', href: '/services/storage/buckets' },
          { label: 'Object Browser', href: '/services/storage/browser' },
          { label: 'Access Policies', href: '/services/storage/policies' },
          { label: 'Usage Analytics', href: '/services/storage/analytics' },
          { label: 'CDN Configuration', href: '/services/storage/cdn' }
        ]
      },
      { 
        title: 'Redis', 
        href: '/services/redis',
        icon: 'zap',
        status: 'running',
        description: 'Redis cache service',
        submenu: [
          { label: 'Key Browser', href: '/services/redis/browser' },
          { label: 'Memory Analysis', href: '/services/redis/memory' },
          { label: 'Configuration', href: '/services/redis/config' },
          { label: 'Pub/Sub Monitor', href: '/services/redis/pubsub' },
          { label: 'Slow Query Log', href: '/services/redis/slowlog' }
        ]
      },
      { 
        title: 'Email (Mailpit)', 
        href: '/services/email',
        icon: 'mail',
        status: 'running',
        description: 'Email service and testing',
        submenu: [
          { label: 'Inbox Viewer', href: '/services/email/inbox' },
          { label: 'SMTP Configuration', href: '/services/email/smtp' },
          { label: 'Email Templates', href: '/services/email/templates' },
          { label: 'Test Email Sender', href: '/services/email/test' }
        ]
      },
      { 
        title: 'Nginx', 
        href: '/services/nginx',
        icon: 'server',
        status: 'running',
        description: 'Web server and reverse proxy',
        submenu: [
          { label: 'Configuration Editor', href: '/services/nginx/config' },
          { label: 'Virtual Hosts', href: '/services/nginx/vhosts' },
          { label: 'SSL Management', href: '/services/nginx/ssl' },
          { label: 'Access Logs', href: '/services/nginx/logs' },
          { label: 'Load Balancing', href: '/services/nginx/balancing' }
        ]
      }
    ]
  },
  {
    title: 'Database',
    links: [
      { 
        title: 'Sync', 
        href: '/database/sync',
        icon: 'refresh',
        description: 'Database synchronization',
        submenu: [
          { label: 'Database Synchronization', href: '/database/sync' },
          { label: 'Schema Sync', href: '/database/sync/schema' },
          { label: 'Data Sync', href: '/database/sync/data' },
          { label: 'Conflict Resolution', href: '/database/sync/conflicts' }
        ]
      },
      { 
        title: 'Seed', 
        href: '/database/seed',
        icon: 'sprout',
        description: 'Seed data management',
        submenu: [
          { label: 'Seed Data Manager', href: '/database/seed' },
          { label: 'Test Data Generator', href: '/database/seed/generator' },
          { label: 'Import CSV/JSON', href: '/database/seed/import' },
          { label: 'Faker Integration', href: '/database/seed/faker' }
        ]
      },
      { 
        title: 'Migrate', 
        href: '/database/migrate',
        icon: 'git-commit',
        description: 'Database migrations',
        submenu: [
          { label: 'Migration History', href: '/database/migrate' },
          { label: 'Create Migration', href: '/database/migrate/create' },
          { label: 'Rollback/Forward', href: '/database/migrate/rollback' },
          { label: 'Auto-migration', href: '/database/migrate/auto' }
        ]
      },
      { 
        title: 'Backup', 
        href: '/database/backup',
        icon: 'save',
        description: 'Database backups',
        submenu: [
          { label: 'Manual Backup', href: '/database/backup' },
          { label: 'Scheduled Backups', href: '/database/backup/scheduled' },
          { label: 'Point-in-time Recovery', href: '/database/backup/pitr' }
        ]
      },
      { 
        title: 'Restore', 
        href: '/database/restore',
        icon: 'rotate-ccw',
        description: 'Database restoration',
        submenu: [
          { label: 'Restore from Backup', href: '/database/restore' },
          { label: 'Selective Restore', href: '/database/restore/selective' },
          { label: 'Cross-environment Restore', href: '/database/restore/cross-env' }
        ]
      },
      { 
        title: 'Analyze', 
        href: '/database/analyze',
        icon: 'chart-bar',
        description: 'Database analysis',
        submenu: [
          { label: 'Query Performance', href: '/database/analyze/queries' },
          { label: 'Index Advisor', href: '/database/analyze/indexes' },
          { label: 'Table Statistics', href: '/database/analyze/tables' },
          { label: 'Vacuum & Optimize', href: '/database/analyze/vacuum' }
        ]
      },
      { 
        title: 'Schema', 
        href: '/database/schema',
        icon: 'layers',
        description: 'Schema design tools',
        submenu: [
          { label: 'Visual Designer', href: '/database/schema' },
          { label: 'DDL Editor', href: '/database/schema/ddl' },
          { label: 'Relationships', href: '/database/schema/relationships' },
          { label: 'Constraints & Indexes', href: '/database/schema/constraints' }
        ]
      }
    ]
  },
  {
    title: 'Deployment',
    links: [
      { 
        title: 'Setup', 
        href: '/deployment/setup',
        icon: 'package',
        description: 'Initial setup and configuration',
        submenu: [
          { label: 'Initial Configuration', href: '/deployment/setup' },
          { label: 'Environment Setup', href: '/deployment/setup/env' },
          { label: 'Prerequisites Check', href: '/deployment/setup/prereq' },
          { label: 'Quick Start Wizard', href: '/deployment/setup/wizard' }
        ]
      },
      { 
        title: 'Development', 
        href: '/deployment/dev',
        icon: 'code',
        description: 'Development environment',
        submenu: [
          { label: 'Local Environment', href: '/deployment/dev' },
          { label: 'Hot Reload Settings', href: '/deployment/dev/reload' },
          { label: 'Debug Configuration', href: '/deployment/dev/debug' },
          { label: 'Dev Tools', href: '/deployment/dev/tools' }
        ]
      },
      { 
        title: 'Staging', 
        href: '/deployment/staging',
        icon: 'test-tube',
        description: 'Staging environment',
        submenu: [
          { label: 'Staging Environment', href: '/deployment/staging' },
          { label: 'Pre-production Tests', href: '/deployment/staging/tests' },
          { label: 'Performance Testing', href: '/deployment/staging/performance' },
          { label: 'UAT Management', href: '/deployment/staging/uat' }
        ]
      },
      { 
        title: 'Production', 
        href: '/deployment/prod',
        icon: 'rocket',
        description: 'Production deployment',
        submenu: [
          { label: 'Production Deploy', href: '/deployment/prod' },
          { label: 'Rolling Updates', href: '/deployment/prod/rolling' },
          { label: 'Blue-Green Deploy', href: '/deployment/prod/blue-green' },
          { label: 'Canary Releases', href: '/deployment/prod/canary' }
        ]
      },
      { 
        title: 'Sync', 
        href: '/deployment/sync',
        icon: 'git-pull-request',
        description: 'Environment synchronization',
        submenu: [
          { label: 'Environment Sync', href: '/deployment/sync' },
          { label: 'Database Sync', href: '/deployment/sync/database' },
          { label: 'Configuration Sync', href: '/deployment/sync/config' },
          { label: 'File Sync', href: '/deployment/sync/files' }
        ]
      },
      { 
        title: 'Secrets', 
        href: '/deployment/secrets',
        icon: 'key',
        description: 'Secret management',
        submenu: [
          { label: 'Secret Management', href: '/deployment/secrets' },
          { label: 'Vault Integration', href: '/deployment/secrets/vault' },
          { label: 'Environment Variables', href: '/deployment/secrets/env' },
          { label: 'API Keys & Tokens', href: '/deployment/secrets/keys' }
        ]
      },
      { 
        title: 'CI/CD', 
        href: '/deployment/cicd',
        icon: 'git-merge',
        description: 'Continuous integration/deployment',
        submenu: [
          { label: 'Pipeline Configuration', href: '/deployment/cicd' },
          { label: 'Build Status', href: '/deployment/cicd/builds' },
          { label: 'Deployment History', href: '/deployment/cicd/history' },
          { label: 'Rollback Management', href: '/deployment/cicd/rollback' }
        ]
      }
    ]
  },
  {
    title: 'System',
    links: [
      { 
        title: 'Resources', 
        href: '/system/resources',
        icon: 'cpu',
        description: 'System resource monitoring',
        submenu: [
          { label: 'CPU & Memory', href: '/system/resources/cpu' },
          { label: 'Disk Usage', href: '/system/resources/disk' },
          { label: 'Network I/O', href: '/system/resources/network' },
          { label: 'Process Manager', href: '/system/resources/processes' }
        ]
      },
      { 
        title: 'Logs', 
        href: '/system/logs',
        icon: 'file-text',
        description: 'System and application logs',
        submenu: [
          { label: 'System Logs', href: '/system/logs/system' },
          { label: 'Application Logs', href: '/system/logs/app' },
          { label: 'Error Tracking', href: '/system/logs/errors' },
          { label: 'Log Export', href: '/system/logs/export' }
        ]
      },
      { 
        title: 'Security', 
        href: '/system/security',
        icon: 'lock',
        description: 'Security management',
        submenu: [
          { label: 'Security Audit', href: '/system/security/audit' },
          { label: 'Firewall Rules', href: '/system/security/firewall' },
          { label: 'Access Control', href: '/system/security/access' },
          { label: 'SSL/TLS Status', href: '/system/security/ssl' }
        ]
      },
      { 
        title: 'Performance', 
        href: '/system/performance',
        icon: 'gauge',
        description: 'Performance monitoring',
        submenu: [
          { label: 'Performance Metrics', href: '/system/performance/metrics' },
          { label: 'Bottleneck Analysis', href: '/system/performance/bottlenecks' },
          { label: 'Optimization Tips', href: '/system/performance/optimize' },
          { label: 'Caching Status', href: '/system/performance/cache' }
        ]
      },
      { 
        title: 'Updates', 
        href: '/system/updates',
        icon: 'download',
        description: 'System updates and patches',
        submenu: [
          { label: 'System Updates', href: '/system/updates' },
          { label: 'Package Updates', href: '/system/updates/packages' },
          { label: 'Security Patches', href: '/system/updates/security' },
          { label: 'Version Management', href: '/system/updates/versions' }
        ]
      }
    ]
  },
  {
    title: 'Tools',
    links: [
      { 
        title: 'GraphQL', 
        href: '/tools/graphql',
        icon: 'git-branch',
        description: 'GraphQL development tools',
        submenu: [
          { label: 'GraphiQL Interface', href: '/tools/graphql' },
          { label: 'Schema Explorer', href: '/tools/graphql/schema' },
          { label: 'Query History', href: '/tools/graphql/history' },
          { label: 'Subscription Testing', href: '/tools/graphql/subscriptions' }
        ]
      },
      { 
        title: 'API Explorer', 
        href: '/tools/api',
        icon: 'code',
        description: 'REST API testing tools',
        submenu: [
          { label: 'REST API Testing', href: '/tools/api' },
          { label: 'Request Builder', href: '/tools/api/builder' },
          { label: 'Response Inspector', href: '/tools/api/inspector' },
          { label: 'API Documentation', href: '/tools/api/docs' }
        ]
      },
      { 
        title: 'Terminal', 
        href: '/tools/terminal',
        icon: 'terminal',
        description: 'Web-based terminal',
        submenu: [
          { label: 'Web Terminal', href: '/tools/terminal' },
          { label: 'SSH Access', href: '/tools/terminal/ssh' },
          { label: 'Command History', href: '/tools/terminal/history' },
          { label: 'Script Runner', href: '/tools/terminal/scripts' }
        ]
      },
      { 
        title: 'Database Tools', 
        href: '/tools/database',
        icon: 'database',
        description: 'Database utilities',
        submenu: [
          { label: 'Query Builder', href: '/tools/database/query' },
          { label: 'Data Import/Export', href: '/tools/database/import' },
          { label: 'Schema Compare', href: '/tools/database/compare' },
          { label: 'Migration Generator', href: '/tools/database/migrate' }
        ]
      },
      { 
        title: 'Code Generator', 
        href: '/tools/codegen',
        icon: 'wand',
        description: 'Code generation tools',
        submenu: [
          { label: 'Model Generator', href: '/tools/codegen/models' },
          { label: 'API Generator', href: '/tools/codegen/api' },
          { label: 'Form Builder', href: '/tools/codegen/forms' },
          { label: 'TypeScript Types', href: '/tools/codegen/types' }
        ]
      },
      { 
        title: 'Testing', 
        href: '/tools/testing',
        icon: 'flask',
        description: 'Testing tools',
        submenu: [
          { label: 'Test Runner', href: '/tools/testing' },
          { label: 'API Testing', href: '/tools/testing/api' },
          { label: 'Load Testing', href: '/tools/testing/load' },
          { label: 'Test Reports', href: '/tools/testing/reports' }
        ]
      },
      { 
        title: 'Webhooks', 
        href: '/tools/webhooks',
        icon: 'webhook',
        description: 'Webhook management',
        submenu: [
          { label: 'Webhook Manager', href: '/tools/webhooks' },
          { label: 'Event Listeners', href: '/tools/webhooks/events' },
          { label: 'Webhook Testing', href: '/tools/webhooks/test' },
          { label: 'Delivery Logs', href: '/tools/webhooks/logs' }
        ]
      },
      { 
        title: 'Documentation', 
        href: '/tools/docs',
        icon: 'book',
        description: 'Documentation tools',
        submenu: [
          { label: 'API Documentation', href: '/tools/docs/api' },
          { label: 'Schema Documentation', href: '/tools/docs/schema' },
          { label: 'Markdown Editor', href: '/tools/docs/editor' },
          { label: 'Changelog', href: '/tools/docs/changelog' }
        ]
      }
    ]
  },
  {
    title: 'Settings',
    position: 'bottom',
    links: [
      { 
        title: 'Settings', 
        href: '/settings',
        icon: 'cog',
        description: 'Application settings',
        submenu: [
          { label: 'User Preferences', href: '/settings/preferences' },
          { label: 'Theme Settings', href: '/settings/theme' },
          { label: 'Notification Settings', href: '/settings/notifications' },
          { label: 'API Tokens', href: '/settings/tokens' }
        ]
      },
      { 
        title: 'Help', 
        href: '/help',
        icon: 'help-circle',
        description: 'Help and support',
        submenu: [
          { label: 'Documentation Links', href: '/help/docs' },
          { label: 'Video Tutorials', href: '/help/tutorials' },
          { label: 'Support Contact', href: '/help/support' },
          { label: 'FAQ', href: '/help/faq' }
        ]
      }
    ]
  }
]

export const flatNavigation = navigation.flatMap(group => 
  group.links.flatMap(link => [
    link,
    ...(link.submenu?.filter(item => !item.separator).map(subitem => ({
      ...subitem,
      title: subitem.label,
      parent: link.title
    })) || [])
  ])
)

export function findNavItem(href: string) {
  return flatNavigation.find(item => item.href === href)
}

export function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const item = findNavItem(currentPath)
    if (item) {
      breadcrumbs.push({
        title: item.title,
        href: currentPath
      })
    }
  }
  
  return breadcrumbs
}