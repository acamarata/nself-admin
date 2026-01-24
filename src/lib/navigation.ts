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
          { label: 'Overview', href: '/database' },
          { label: 'SQL Console', href: '/database/sql' },
          { label: 'Schema', href: '/database/schema' },
          { label: 'Migrations', href: '/database/migrations' },
          { label: 'Seeds', href: '/database/seeds' },
          { label: 'Backup', href: '/database/backup' },
          { label: 'Restore', href: '/database/restore' },
          { label: 'Inspect', href: '/database/inspect' },
          { label: 'Types', href: '/database/types' },
          { label: 'Mock Data', href: '/database/mock' },
        ],
      },
      {
        title: 'Monitor',
        href: '/monitor',
        icon: 'activity',
        description: 'System monitoring and alerts',
        submenu: [
          { label: 'Overview', href: '/monitor' },
          { label: 'Grafana', href: '/monitor/grafana' },
          { label: 'Alerts', href: '/monitor/alerts' },
          { label: 'Metrics', href: '/monitor/metrics' },
          { label: 'Logs', href: '/monitor/logs' },
          { label: 'Traces', href: '/monitor/traces' },
        ],
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
    title: 'Plugins',
    links: [
      {
        title: 'Plugins',
        href: '/plugins',
        icon: 'plug',
        badge: { text: 'NEW', color: 'emerald' },
        description: 'Third-party integrations',
        submenu: [
          { label: 'Installed', href: '/plugins' },
          { label: 'Marketplace', href: '/plugins/marketplace' },
        ],
      },
      {
        title: 'Stripe',
        href: '/plugins/stripe',
        icon: 'credit-card',
        description: 'Payment processing',
        submenu: [
          { label: 'Dashboard', href: '/plugins/stripe' },
          { label: 'Customers', href: '/plugins/stripe/customers' },
          { label: 'Subscriptions', href: '/plugins/stripe/subscriptions' },
          { label: 'Invoices', href: '/plugins/stripe/invoices' },
          { label: 'Products', href: '/plugins/stripe/products' },
          { label: 'Webhooks', href: '/plugins/stripe/webhooks' },
        ],
      },
      {
        title: 'GitHub',
        href: '/plugins/github',
        icon: 'github',
        description: 'DevOps integration',
        submenu: [
          { label: 'Dashboard', href: '/plugins/github' },
          { label: 'Repositories', href: '/plugins/github/repos' },
          { label: 'Issues', href: '/plugins/github/issues' },
          { label: 'Pull Requests', href: '/plugins/github/prs' },
          { label: 'Actions', href: '/plugins/github/actions' },
        ],
      },
      {
        title: 'Shopify',
        href: '/plugins/shopify',
        icon: 'shopping-cart',
        description: 'E-commerce sync',
        submenu: [
          { label: 'Dashboard', href: '/plugins/shopify' },
          { label: 'Products', href: '/plugins/shopify/products' },
          { label: 'Orders', href: '/plugins/shopify/orders' },
          { label: 'Customers', href: '/plugins/shopify/customers' },
          { label: 'Inventory', href: '/plugins/shopify/inventory' },
        ],
      },
    ],
  },
  {
    title: 'Infrastructure',
    links: [
      {
        title: 'Cloud',
        href: '/cloud',
        icon: 'cloud',
        badge: { text: 'NEW', color: 'emerald' },
        description: 'Cloud infrastructure',
        submenu: [
          { label: 'Overview', href: '/cloud' },
          { label: 'Providers', href: '/cloud/providers' },
          { label: 'Servers', href: '/cloud/servers' },
          { label: 'Costs', href: '/cloud/costs' },
        ],
      },
      {
        title: 'Kubernetes',
        href: '/k8s',
        icon: 'ship',
        badge: { text: 'NEW', color: 'emerald' },
        description: 'K8s management',
        submenu: [
          { label: 'Overview', href: '/k8s' },
          { label: 'Clusters', href: '/k8s/clusters' },
          { label: 'Deployments', href: '/k8s/deploy' },
          { label: 'Namespaces', href: '/k8s/namespaces' },
          { label: 'Logs', href: '/k8s/logs' },
          { label: 'Scale', href: '/k8s/scale' },
        ],
      },
      {
        title: 'Helm',
        href: '/helm',
        icon: 'anchor',
        badge: { text: 'NEW', color: 'emerald' },
        description: 'Helm charts',
        submenu: [
          { label: 'Releases', href: '/helm' },
          { label: 'Install', href: '/helm/install' },
          { label: 'Values', href: '/helm/values' },
          { label: 'Repositories', href: '/helm/repos' },
        ],
      },
    ],
  },
  {
    title: 'Performance',
    links: [
      {
        title: 'Performance',
        href: '/performance',
        icon: 'gauge',
        badge: { text: 'NEW', color: 'emerald' },
        description: 'System performance',
        submenu: [
          { label: 'Overview', href: '/performance' },
          { label: 'Profile', href: '/performance/profile' },
          { label: 'Slow Queries', href: '/performance/queries' },
          { label: 'Suggestions', href: '/performance/suggest' },
        ],
      },
      {
        title: 'Benchmark',
        href: '/benchmark',
        icon: 'timer',
        description: 'Benchmarking tools',
        submenu: [
          { label: 'Overview', href: '/benchmark' },
          { label: 'Run', href: '/benchmark/run' },
          { label: 'Baseline', href: '/benchmark/baseline' },
          { label: 'Compare', href: '/benchmark/compare' },
        ],
      },
      {
        title: 'Scale',
        href: '/scale',
        icon: 'maximize',
        description: 'Service scaling',
        submenu: [
          { label: 'Overview', href: '/scale' },
          { label: 'Autoscaling', href: '/scale/auto' },
        ],
      },
    ],
  },
  {
    title: 'Deployment',
    links: [
      {
        title: 'Environments',
        href: '/environments',
        icon: 'layers',
        description: 'Environment management',
        submenu: [
          { label: 'Overview', href: '/environments' },
          { label: 'Local', href: '/environments/local' },
          { label: 'Staging', href: '/environments/staging' },
          { label: 'Production', href: '/environments/production' },
          { label: 'Compare', href: '/environments/diff' },
        ],
      },
      {
        title: 'Deploy',
        href: '/deploy',
        icon: 'rocket',
        description: 'Deployment management',
        submenu: [
          { label: 'Overview', href: '/deploy' },
          { label: 'Preview', href: '/deploy/preview' },
          { label: 'Canary', href: '/deploy/canary' },
          { label: 'Blue-Green', href: '/deploy/blue-green' },
          { label: 'Rollback', href: '/deploy/rollback' },
        ],
      },
      {
        title: 'Sync',
        href: '/sync',
        icon: 'refresh-cw',
        description: 'Data synchronization',
        submenu: [
          { label: 'Overview', href: '/sync' },
          { label: 'History', href: '/sync/history' },
        ],
      },
      {
        title: 'History',
        href: '/history',
        icon: 'clock',
        description: 'Operation history',
        submenu: [
          { label: 'All', href: '/history' },
          { label: 'Deployments', href: '/history/deployments' },
          { label: 'Migrations', href: '/history/migrations' },
          { label: 'Commands', href: '/history/commands' },
        ],
      },
    ],
  },
  {
    title: 'Config',
    links: [
      {
        title: 'Configuration',
        href: '/config',
        icon: 'settings',
        description: 'System configuration',
        submenu: [
          { label: 'Environment', href: '/config/env' },
          { label: 'Secrets', href: '/config/secrets' },
          { label: 'SSL/TLS', href: '/config/ssl' },
          { label: 'CORS', href: '/config/cors' },
          { label: 'Rate Limits', href: '/config/rate-limits' },
          { label: 'Email', href: '/config/email' },
          { label: 'Docker', href: '/config/docker' },
          { label: 'Validate', href: '/config/validate' },
        ],
      },
      {
        title: 'Frontend',
        href: '/frontend',
        icon: 'layout',
        description: 'Frontend apps',
        submenu: [
          { label: 'All Apps', href: '/frontend' },
          { label: 'Add App', href: '/frontend/add' },
        ],
      },
      {
        title: 'CI/CD',
        href: '/cicd',
        icon: 'git-merge',
        description: 'CI/CD pipelines',
      },
    ],
  },
  {
    title: 'Core Stack',
    collapsed: true,
    links: [
      {
        title: 'PostgreSQL',
        href: '/stack/postgresql',
        icon: 'database',
        status: 'running',
        description: 'PostgreSQL database',
      },
      {
        title: 'Hasura',
        href: '/stack/hasura',
        icon: 'git-branch',
        status: 'running',
        description: 'GraphQL Engine',
      },
      {
        title: 'Auth',
        href: '/stack/auth',
        icon: 'shield',
        status: 'running',
        description: 'Authentication service',
      },
      {
        title: 'MinIO',
        href: '/stack/minio',
        icon: 'hard-drive',
        status: 'running',
        description: 'Object storage',
      },
      {
        title: 'Redis',
        href: '/stack/redis',
        icon: 'zap',
        status: 'running',
        description: 'Cache service',
      },
      {
        title: 'Nginx',
        href: '/stack/nginx',
        icon: 'server',
        status: 'running',
        description: 'Reverse proxy',
      },
      {
        title: 'MailHog',
        href: '/stack/mailhog',
        icon: 'mail',
        description: 'Email testing',
      },
    ],
  },
  {
    title: 'Tools',
    collapsed: true,
    links: [
      {
        title: 'GraphQL',
        href: '/dev/graphql',
        icon: 'git-branch',
        description: 'GraphQL playground',
      },
      {
        title: 'API Explorer',
        href: '/dev/api',
        icon: 'code',
        description: 'REST API testing',
      },
      {
        title: 'Terminal',
        href: '/dev/terminal',
        icon: 'terminal',
        description: 'Web terminal',
      },
      {
        title: 'Webhooks',
        href: '/dev/webhooks',
        icon: 'webhook',
        description: 'Webhook management',
      },
      {
        title: 'Type Generator',
        href: '/dev/types',
        icon: 'file-code',
        description: 'Generate TypeScript types',
      },
      {
        title: 'Scaffolding',
        href: '/dev/scaffold',
        icon: 'package',
        description: 'Code scaffolding',
      },
    ],
  },
  {
    title: 'System',
    position: 'bottom',
    links: [
      {
        title: 'URLs',
        href: '/system/urls',
        icon: 'link',
        description: 'Service URLs',
      },
      {
        title: 'Updates',
        href: '/system/updates',
        icon: 'download',
        description: 'System updates',
      },
      {
        title: 'Help',
        href: '/system/help',
        icon: 'help-circle',
        description: 'Help & support',
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
