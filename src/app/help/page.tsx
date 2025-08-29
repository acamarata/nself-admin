'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  HelpCircle, Book, Video, MessageCircle, ExternalLink, Search, 
  ChevronRight, ChevronDown, Copy, CheckCircle, XCircle, AlertCircle,
  Clock, Mail, Phone, MessageSquare, FileText, Download, Upload,
  Keyboard, Command, Zap, Database, Server, Globe, Shield,
  Settings, Monitor, Activity, BarChart3, Users, Layers,
  Terminal, Code, Webhook, Archive, RefreshCw, Play, Pause,
  Eye, Edit3, Trash2, Plus, Filter, Calendar, User, Bell,
  Info, Star, ThumbsUp, ThumbsDown, Send, Loader2, CheckCircle2
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  views: number
  rating: number
}

interface Documentation {
  id: string
  title: string
  description: string
  category: string
  lastUpdated: string
  url: string
}

interface SystemStatus {
  status: 'operational' | 'maintenance' | 'degraded' | 'outage'
  services: Array<{
    name: string
    status: 'operational' | 'degraded' | 'down'
    description?: string
  }>
  lastUpdated: string
}

interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
}

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: Play },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'deployment', label: 'Deployment', icon: Zap },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle },
  { id: 'api', label: 'API Reference', icon: Code },
  { id: 'security', label: 'Security', icon: Shield }
]

function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const response = await fetch(`/api/help/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        Search Help & Documentation
      </h2>
      
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search documentation, tutorials, FAQ..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-zinc-900 dark:text-white">Search Results</h3>
          {searchResults.map((result, index) => (
            <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-1">{result.title}</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{result.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                  {result.category}
                </span>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  View <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentationSection() {
  const [docs] = useState<Documentation[]>([
    {
      id: '1',
      title: 'Quick Start Guide',
      description: 'Get up and running with nself in minutes',
      category: 'getting-started',
      lastUpdated: '2024-01-20',
      url: '/docs/quickstart'
    },
    {
      id: '2',
      title: 'Configuration Reference',
      description: 'Complete guide to configuring your nself installation',
      category: 'configuration',
      lastUpdated: '2024-01-18',
      url: '/docs/configuration'
    },
    {
      id: '3',
      title: 'Deployment Strategies',
      description: 'Best practices for deploying applications',
      category: 'deployment',
      lastUpdated: '2024-01-15',
      url: '/docs/deployment'
    },
    {
      id: '4',
      title: 'Monitoring & Observability',
      description: 'Set up monitoring, logging, and alerting',
      category: 'monitoring',
      lastUpdated: '2024-01-17',
      url: '/docs/monitoring'
    },
    {
      id: '5',
      title: 'API Authentication',
      description: 'Secure your API endpoints with authentication',
      category: 'api',
      lastUpdated: '2024-01-19',
      url: '/docs/api/auth'
    },
    {
      id: '6',
      title: 'Security Best Practices',
      description: 'Secure your nself deployment',
      category: 'security',
      lastUpdated: '2024-01-16',
      url: '/docs/security'
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredDocs = selectedCategory === 'all' 
    ? docs 
    : docs.filter(doc => doc.category === selectedCategory)

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Book className="w-5 h-5" />
        Documentation
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(category => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => {
          const category = CATEGORIES.find(c => c.id === doc.category)
          const Icon = category?.icon || FileText
          
          return (
            <a
              key={doc.id}
              href={doc.url}
              className="block p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {doc.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-500" />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                  {category?.label}
                </span>
                <span className="text-xs text-zinc-500">
                  Updated {new Date(doc.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function VideoTutorialsSection() {
  const [tutorials] = useState<VideoTutorial[]>([
    {
      id: '1',
      title: 'Getting Started with nself',
      description: 'Complete walkthrough of setting up your first nself project',
      duration: '12:34',
      thumbnail: '/thumbnails/getting-started.jpg',
      category: 'getting-started',
      difficulty: 'beginner',
      views: 15420,
      rating: 4.8
    },
    {
      id: '2',
      title: 'Advanced Configuration',
      description: 'Deep dive into advanced configuration options and customization',
      duration: '18:45',
      thumbnail: '/thumbnails/advanced-config.jpg',
      category: 'configuration',
      difficulty: 'advanced',
      views: 8932,
      rating: 4.6
    },
    {
      id: '3',
      title: 'Monitoring and Alerts Setup',
      description: 'Set up comprehensive monitoring and alerting for your services',
      duration: '15:20',
      thumbnail: '/thumbnails/monitoring.jpg',
      category: 'monitoring',
      difficulty: 'intermediate',
      views: 12156,
      rating: 4.9
    }
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'advanced': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      default: return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5" />
        Video Tutorials
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map(tutorial => (
          <div key={tutorial.id} className="group cursor-pointer">
            <div className="relative bg-zinc-200 dark:bg-zinc-700 rounded-lg aspect-video mb-3 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {tutorial.duration}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {tutorial.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                {tutorial.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(tutorial.difficulty)}`}>
                    {tutorial.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-zinc-500">{tutorial.rating}</span>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">
                  {tutorial.views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          View All Tutorials
        </Button>
      </div>
    </div>
  )
}

function FAQSection() {
  const [faqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page, or by using the nself CLI command `nself auth reset-password`.',
      category: 'getting-started',
      helpful: 23,
      notHelpful: 2
    },
    {
      id: '2',
      question: 'Why is my service not starting?',
      answer: 'Check the service logs first using `nself logs <service-name>`. Common issues include port conflicts, missing environment variables, or insufficient resources. Verify your configuration and ensure all dependencies are running.',
      category: 'troubleshooting',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: '3',
      question: 'How do I configure SSL certificates?',
      answer: 'SSL certificates can be configured through the admin panel under Settings > SSL, or via the CLI using `nself ssl configure`. nself supports both self-signed certificates and Let\'s Encrypt automatic SSL.',
      category: 'security',
      helpful: 38,
      notHelpful: 1
    },
    {
      id: '4',
      question: 'Can I use custom domains?',
      answer: 'Yes! Configure custom domains in the admin panel under Configuration > Domains. Make sure your DNS records point to your nself instance and SSL is properly configured.',
      category: 'configuration',
      helpful: 29,
      notHelpful: 4
    },
    {
      id: '5',
      question: 'How do I backup my data?',
      answer: 'Use the backup functionality in Operations > Backup or run `nself backup create` via CLI. This will backup your databases, uploaded files, and configuration. Schedule automatic backups for production use.',
      category: 'deployment',
      helpful: 52,
      notHelpful: 1
    }
  ])

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const handleFeedback = async (faqId: string, helpful: boolean) => {
    try {
      await fetch(`/api/help/faq/${faqId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful })
      })
    } catch (error) {
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5" />
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <button
              onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span className="font-medium">{faq.question}</span>
              {expandedFAQ === faq.id ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </button>
            
            {expandedFAQ === faq.id && (
              <div className="px-4 pb-4">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">{faq.answer}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(faq.id, true)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {faq.helpful}
                    </button>
                    <button
                      onClick={() => handleFeedback(faq.id, false)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      {faq.notHelpful}
                    </button>
                  </div>
                  
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                    {CATEGORIES.find(c => c.id === faq.category)?.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SupportContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'normal'
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
          priority: 'normal'
        })
      }
    } catch (error) {
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Contact Support
      </h2>

      {submitted ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
            Support Request Submitted
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We&apos;ve received your message and will get back to you within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please describe your issue or question in detail..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            />
          </div>

          <Button type="submit" disabled={submitting} className="flex items-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Message
          </Button>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <h3 className="font-medium mb-3">Other Ways to Reach Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">support@nself.dev</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium">Discord</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Join our community</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm font-medium">Website</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">nself.dev</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemStatusSection() {
  const [status] = useState<SystemStatus>({
    status: 'operational',
    services: [
      { name: 'API Gateway', status: 'operational' },
      { name: 'Database', status: 'operational' },
      { name: 'Authentication', status: 'operational' },
      { name: 'File Storage', status: 'degraded', description: 'Slower than usual response times' },
      { name: 'Email Service', status: 'operational' },
      { name: 'Monitoring', status: 'operational' }
    ],
    lastUpdated: new Date().toISOString()
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'operational':
        return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20', icon: CheckCircle }
      case 'degraded':
        return { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/20', icon: AlertCircle }
      case 'down':
        return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/20', icon: XCircle }
      default:
        return { color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800', icon: Clock }
    }
  }

  const overallConfig = getStatusConfig(status.status)
  const OverallIcon = overallConfig.icon

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        System Status
      </h2>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <OverallIcon className={`w-6 h-6 ${overallConfig.color}`} />
          <div>
            <h3 className="font-semibold text-lg">All Systems {status.status === 'operational' ? 'Operational' : 'Experiencing Issues'}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Last updated: {new Date(status.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {status.services.map((service, index) => {
          const config = getStatusConfig(service.status)
          const Icon = config.icon
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <div>
                  <span className="font-medium">{service.name}</span>
                  {service.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{service.description}</p>
                  )}
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                {service.status === 'operational' ? 'Operational' : 
                 service.status === 'degraded' ? 'Degraded' : 'Down'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          View Status Page
        </Button>
      </div>
    </div>
  )
}

function KeyboardShortcutsSection() {
  const shortcuts: KeyboardShortcut[] = [
    { keys: ['Ctrl', 'K'], description: 'Open command palette', category: 'Navigation' },
    { keys: ['Ctrl', 'Shift', 'P'], description: 'Open search', category: 'Navigation' },
    { keys: ['G', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['G', 'S'], description: 'Go to Services', category: 'Navigation' },
    { keys: ['G', 'L'], description: 'Go to Logs', category: 'Navigation' },
    { keys: ['R'], description: 'Refresh current page', category: 'Actions' },
    { keys: ['Ctrl', 'Enter'], description: 'Submit form', category: 'Actions' },
    { keys: ['Esc'], description: 'Close modal/dialog', category: 'Actions' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
    { keys: ['Ctrl', '/'], description: 'Toggle help panel', category: 'Help' }
  ]

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = []
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Keyboard className="w-5 h-5" />
        Keyboard Shortcuts
      </h2>

      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
          <div key={category}>
            <h3 className="font-medium text-zinc-900 dark:text-white mb-3">{category}</h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono rounded border">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-zinc-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'faq' | 'contact'>('overview')

  return (
    <>
      <HeroPattern />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Help & Support</h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Find answers, learn best practices, and get support for your nself deployment
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'docs', label: 'Documentation', icon: Book },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'contact', label: 'Contact Support', icon: MessageCircle }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <SearchSection />
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <DocumentationSection />
                <KeyboardShortcutsSection />
              </div>
              
              <div className="space-y-8">
                <VideoTutorialsSection />
                <SystemStatusSection />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docs' && <DocumentationSection />}
        {activeTab === 'faq' && <FAQSection />}
        {activeTab === 'contact' && <SupportContactSection />}
      </div>
    </>
  )
}