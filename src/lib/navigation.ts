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
        description: 'System overview and metrics',
      },
      {
        title: 'Config',
        href: '/config',
        icon: 'settings',
        description: 'System configuration and settings',
        submenu: [
          { label: 'Environment Variables', href: '/config/env' },
          { label: 'Secrets Management', href: '/config/secrets' },
          { label: 'SSL/TLS Certificates', href: '/config/ssl' },
          { label: 'CORS Settings', href: '/config/cors' },
          { label: 'Rate Limiting', href: '/config/rate-limits' },
          { label: 'Email Configuration', href: '/config/email' },
          { label: 'Docker Settings', href: '/config/docker' },
          { label: 'Validate Config', href: '/config/validate' },
        ],
      },
      {
        title: 'Services',
        href: '/services',
        icon: 'box',
        description: 'Service management and monitoring',
        submenu: [
          { label: 'All Services', href: '/services' },
          { label: 'Service Health', href: '/services/health' },
          { label: 'Service Logs', href: '/services/logs' },
        ],
      },
      {
        title: 'Database',
        href: '/database',
        icon: 'database',
        description: 'Database management tools',
        submenu: [
          { label: 'SQL Console', href: '/database/sql' },
          { label: 'Schema Designer', href: '/database/schema' },
          { label: 'Console', href: '/database/console' },
        ],
      },
      {
        title: 'Monitor',
        href: '/monitor',
        icon: 'activity',
        description: 'System monitoring and alerts',
      },
      {
        title: 'Doctor',
        href: '/doctor',
        icon: 'heart-pulse',
        description: 'System diagnostics and health',
      },
    ],
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
      },
      {
        title: 'Hasura',
        href: '/services/hasura',
        icon: 'git-branch',
        status: 'running',
        description: 'Hasura GraphQL Engine',
      },
      {
        title: 'Auth Service',
        href: '/services/auth',
        icon: 'shield',
        status: 'running',
        description: 'Authentication and authorization',
      },
      {
        title: 'Functions',
        href: '/services/functions',
        icon: 'function',
        description: 'Serverless functions',
      },
      {
        title: 'Storage (MinIO)',
        href: '/services/storage',
        icon: 'hard-drive',
        status: 'running',
        description: 'Object storage service',
      },
      {
        title: 'Redis',
        href: '/services/redis',
        icon: 'zap',
        status: 'running',
        description: 'Redis cache service',
      },
      {
        title: 'BullMQ',
        href: '/services/bullmq',
        icon: 'layers',
        description: 'Job queue management',
      },
      {
        title: 'Custom Services',
        href: '/services/custom',
        icon: 'box',
        description: 'Custom service definitions',
      },
    ],
  },
  {
    title: 'Database',
    links: [
      {
        title: 'Sync',
        href: '/database/sync',
        icon: 'refresh',
        description: 'Database synchronization',
      },
      {
        title: 'Seed',
        href: '/database/seed',
        icon: 'sprout',
        description: 'Seed data management',
      },
      {
        title: 'Migrations',
        href: '/database/migrations',
        icon: 'git-commit',
        description: 'Database migrations',
      },
      {
        title: 'Backup',
        href: '/database/backup',
        icon: 'save',
        description: 'Database backups',
      },
      {
        title: 'Restore',
        href: '/database/restore',
        icon: 'rotate-ccw',
        description: 'Database restoration',
      },
      {
        title: 'Reset',
        href: '/database/reset',
        icon: 'trash',
        description: 'Reset database',
      },
      {
        title: 'Schema',
        href: '/database/schema',
        icon: 'layers',
        description: 'Schema design tools',
      },
    ],
  },
  {
    title: 'Deployment',
    links: [
      {
        title: 'Environments',
        href: '/deployment/environments',
        icon: 'layers',
        description: 'Manage all environments',
      },
      {
        title: 'Staging',
        href: '/deployment/staging',
        icon: 'test-tube',
        description: 'Staging environment',
      },
      {
        title: 'Production',
        href: '/deployment/prod',
        icon: 'rocket',
        description: 'Production deployment',
      },
      {
        title: 'CI/CD',
        href: '/deployment/cicd',
        icon: 'git-merge',
        description: 'Continuous integration/deployment',
      },
    ],
  },
  {
    title: 'System',
    links: [
      {
        title: 'Resources',
        href: '/system/resources',
        icon: 'cpu',
        description: 'System resource monitoring',
      },
      {
        title: 'Logs',
        href: '/system/logs',
        icon: 'file-text',
        description: 'System and application logs',
      },
      {
        title: 'Updates',
        href: '/system/updates',
        icon: 'download',
        description: 'System updates and patches',
      },
      {
        title: 'Diagnostics',
        href: '/system/diagnostics',
        icon: 'activity',
        description: 'System diagnostics',
      },
      {
        title: 'URLs',
        href: '/system/urls',
        icon: 'link',
        description: 'Service URLs',
      },
      {
        title: 'Trust',
        href: '/system/trust',
        icon: 'shield-check',
        description: 'Certificate trust',
      },
      {
        title: 'Version',
        href: '/system/version',
        icon: 'tag',
        description: 'Version information',
      },
    ],
  },
  {
    title: 'Tools',
    links: [
      {
        title: 'GraphQL',
        href: '/tools/graphql',
        icon: 'git-branch',
        description: 'GraphQL development tools',
      },
      {
        title: 'API Explorer',
        href: '/tools/api',
        icon: 'code',
        description: 'REST API testing tools',
      },
      {
        title: 'Terminal',
        href: '/tools/terminal',
        icon: 'terminal',
        description: 'Web-based terminal',
      },
      {
        title: 'Webhooks',
        href: '/tools/webhooks',
        icon: 'webhook',
        description: 'Webhook management',
      },
    ],
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
      },
      {
        title: 'Help',
        href: '/help',
        icon: 'help-circle',
        description: 'Help and support',
      },
    ],
  },
]

export const flatNavigation = navigation.flatMap((group) =>
  group.links.flatMap((link) => [
    link,
    ...(link.submenu
      ?.filter((item) => !item.separator)
      .map((subitem) => ({
        ...subitem,
        title: subitem.label,
        parent: link.title,
      })) || []),
  ]),
)

export function findNavItem(href: string) {
  return flatNavigation.find((item) => item.href === href)
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
        href: currentPath,
      })
    }
  }

  return breadcrumbs
}
