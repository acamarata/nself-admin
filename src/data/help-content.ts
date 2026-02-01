// Help content data structure
export interface HelpArticle {
  id: string
  title: string
  category: string
  content: string
  tags?: string[]
}

export const helpArticles: Record<string, HelpArticle> = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'Basics',
    content: 'Welcome to nself-admin! This guide will help you get started.',
  },
  'api-reference': {
    id: 'api-reference',
    title: 'API Reference',
    category: 'API',
    content: 'API documentation coming soon.',
  },
  'cli-commands': {
    id: 'cli-commands',
    title: 'CLI Commands',
    category: 'CLI',
    content: 'CLI commands documentation coming soon.',
  },
  'database-guide': {
    id: 'database-guide',
    title: 'Database Guide',
    category: 'Database',
    content: 'Database operations guide coming soon.',
  },
  'deployment-guide': {
    id: 'deployment-guide',
    title: 'Deployment Guide',
    category: 'Deployment',
    content: 'Deployment guide coming soon.',
  },
  'services-guide': {
    id: 'services-guide',
    title: 'Services Guide',
    category: 'Services',
    content: 'Services management guide coming soon.',
  },
}

export const helpCategories = [
  'Basics',
  'API',
  'CLI',
  'Database',
  'Deployment',
  'Services',
]
