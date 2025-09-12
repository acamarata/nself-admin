const fs = require('fs')
const path = require('path')

const pageData = {
  // Dashboard pages
  '/dashboard/health': {
    title: 'Health Monitor',
    description: 'Monitor the health status of all services',
  },
  '/dashboard/metrics': {
    title: 'System Metrics',
    description: 'View detailed performance metrics and analytics',
  },
  '/dashboard/logs': {
    title: 'Activity Logs',
    description: 'Browse and filter system activity logs',
  },
  '/dashboard/alerts': {
    title: 'Alerts',
    description: 'Manage system alerts and notifications',
  },
  '/dashboard/status': {
    title: 'System Status',
    description: 'Real-time status of all system components',
  },

  // Database pages
  '/database/console': {
    title: 'Database Console',
    description: 'Interactive PostgreSQL database console',
  },
  '/database/migrations': {
    title: 'Migrations',
    description: 'Manage database migrations and schema changes',
  },
  '/database/backup': {
    title: 'Database Backup',
    description: 'Create and manage database backups',
  },
  '/database/restore': {
    title: 'Database Restore',
    description: 'Restore database from backups',
  },
  '/database/seed': {
    title: 'Seed Data',
    description: 'Manage database seed data and fixtures',
  },
  '/database/reset': {
    title: 'Reset Database',
    description: 'Reset database to initial state',
  },
  '/database/sql': {
    title: 'SQL Editor',
    description: 'Execute SQL queries directly',
  },
  '/database/schema': {
    title: 'Database Schema',
    description: 'View and manage database schema',
  },

  // Stack pages
  '/stack': {
    title: 'Stack Services',
    description: 'Manage all core stack services',
  },
  '/stack/postgresql': {
    title: 'PostgreSQL',
    description: 'PostgreSQL database service management',
  },
  '/stack/hasura': {
    title: 'Hasura GraphQL',
    description: 'Hasura GraphQL engine management',
  },
  '/stack/auth': {
    title: 'Hasura Auth',
    description: 'Authentication service management',
  },
  '/stack/minio': {
    title: 'MinIO Storage',
    description: 'S3-compatible object storage management',
  },
  '/stack/redis': {
    title: 'Redis Cache',
    description: 'Redis cache service management',
  },
  '/stack/nginx': {
    title: 'Nginx',
    description: 'Nginx web server and reverse proxy',
  },
  '/stack/mailhog': { title: 'Mailhog', description: 'Email testing service' },

  // Services pages
  '/services': {
    title: 'User Services',
    description: 'Manage all user-defined services',
  },
  '/services/nestjs': {
    title: 'NestJS Services',
    description: 'Manage NestJS microservices',
  },
  '/services/bullmq': {
    title: 'BullMQ Workers',
    description: 'Manage BullMQ job queues and workers',
  },
  '/services/functions': {
    title: 'Serverless Functions',
    description: 'Manage serverless functions',
  },
  '/services/golang': {
    title: 'GoLang Services',
    description: 'Manage Go microservices',
  },
  '/services/python': {
    title: 'Python Services',
    description: 'Manage Python microservices',
  },
  '/services/custom': {
    title: 'Custom Services',
    description: 'Manage custom user services',
  },
  '/services/logs': {
    title: 'Service Logs',
    description: 'View logs for all services',
  },

  // Configuration pages
  '/config/env': {
    title: 'Environment Variables',
    description: 'Manage environment configuration',
  },
  '/config/docker': {
    title: 'Docker Compose',
    description: 'Docker compose configuration',
  },
  '/config/secrets': {
    title: 'Secrets Management',
    description: 'Manage application secrets securely',
  },
  '/config/ssl': {
    title: 'SSL & Domains',
    description: 'SSL certificates and domain configuration',
  },
  '/config/email': {
    title: 'Email Configuration',
    description: 'Configure email service providers',
  },
  '/config/cors': {
    title: 'CORS Settings',
    description: 'Configure Cross-Origin Resource Sharing',
  },
  '/config/rate-limits': {
    title: 'Rate Limiting',
    description: 'Configure API rate limits',
  },
  '/config/validate': {
    title: 'Configuration Validation',
    description: 'Validate system configuration',
  },

  // Operations pages
  '/operations/backup': {
    title: 'Backup Manager',
    description: 'Comprehensive backup management',
  },
  '/operations/deploy': {
    title: 'Deployment',
    description: 'Deploy to production environments',
  },
  '/operations/scale': {
    title: 'Scale Services',
    description: 'Scale services up or down',
  },
  '/operations/monitor': {
    title: 'Monitoring Dashboard',
    description: 'Real-time monitoring dashboard',
  },
  '/operations/data': {
    title: 'Import/Export',
    description: 'Import and export data',
  },
  '/operations/cleanup': {
    title: 'Resource Cleanup',
    description: 'Clean up unused resources',
  },
  '/operations/rollback': {
    title: 'Rollback',
    description: 'Rollback to previous versions',
  },
  '/operations/snapshots': {
    title: 'Snapshots',
    description: 'Manage system snapshots',
  },

  // Development pages
  '/dev/graphql': {
    title: 'GraphQL Playground',
    description: 'Interactive GraphQL development environment',
  },
  '/dev/api': {
    title: 'API Explorer',
    description: 'Explore and test API endpoints',
  },
  '/dev/webhooks': {
    title: 'Webhook Testing',
    description: 'Test and debug webhooks',
  },
  '/dev/types': {
    title: 'TypeScript Types',
    description: 'Generate TypeScript type definitions',
  },
  '/dev/seed': {
    title: 'Seed Manager',
    description: 'Manage development seed data',
  },
  '/dev/terminal': {
    title: 'Web Terminal',
    description: 'Browser-based terminal interface',
  },
  '/dev/scaffold': {
    title: 'Scaffold Generator',
    description: 'Generate boilerplate code',
  },
  '/dev/testing': {
    title: 'Testing Tools',
    description: 'Testing utilities and runners',
  },

  // System pages
  '/system/doctor': {
    title: 'System Doctor',
    description: 'Run system diagnostics and health checks',
  },
  '/system/updates': {
    title: 'Updates',
    description: 'Manage system and dependency updates',
  },
  '/system/validate': {
    title: 'Configuration Validator',
    description: 'Validate system configuration',
  },
  '/system/trust': {
    title: 'Trust Certificates',
    description: 'Manage trusted certificates',
  },
  '/system/urls': {
    title: 'Service URLs',
    description: 'View all service endpoints and URLs',
  },
  '/system/version': {
    title: 'Version Information',
    description: 'System and component version details',
  },
  '/system/help': {
    title: 'Help & Documentation',
    description: 'Access help and documentation',
  },
  '/system/diagnostics': {
    title: 'Diagnostics',
    description: 'Advanced system diagnostics',
  },
}

const pageTemplate = (title, description) => `'use client'

import { PageTemplate } from '@/components/PageTemplate'

export default function Page() {
  return (
    <PageTemplate 
      title="${title}"
      description="${description}"
    />
  )
}`

// Create all the pages
Object.entries(pageData).forEach(([pagePath, { title, description }]) => {
  const dirPath = path.join(__dirname, 'src/app', pagePath)
  const filePath = path.join(dirPath, 'page.tsx')

  // Create directory if it doesn't exist
  fs.mkdirSync(dirPath, { recursive: true })

  // Only create the file if it doesn't exist
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, pageTemplate(title, description))
    console.log(`Created: ${pagePath}/page.tsx`)
  } else {
    console.log(`Skipped (exists): ${pagePath}/page.tsx`)
  }
})

console.log('\nAll pages generated successfully!')
