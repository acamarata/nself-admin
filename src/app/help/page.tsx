'use client'

import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import {
  Activity,
  AlertCircle,
  Book,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Keyboard,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Monitor,
  Play,
  Search,
  Send,
  Settings,
  Shield,
  Star,
  ThumbsDown,
  ThumbsUp,
  Video,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

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
  { id: 'security', label: 'Security', icon: Shield },
]

function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(
        `/api/help/search?q=${encodeURIComponent(searchQuery)}`,
      )
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (_error) {
      // Intentionally empty - search results remain empty on error
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Search className="h-5 w-5" />
        Search Help & Documentation
      </h2>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search documentation, tutorials, FAQ..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-3 pr-4 pl-10 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={searching || !searchQuery.trim()}
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-zinc-900 dark:text-white">
            Search Results
          </h3>
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50"
            >
              <h4 className="mb-1 font-medium text-blue-600 dark:text-blue-400">
                {result.title}
              </h4>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                {result.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  {result.category}
                </span>
                <button className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
                  View <ExternalLink className="h-3 w-3" />
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
      url: '/docs/quickstart',
    },
    {
      id: '2',
      title: 'Configuration Reference',
      description: 'Complete guide to configuring your nself installation',
      category: 'configuration',
      lastUpdated: '2024-01-18',
      url: '/docs/configuration',
    },
    {
      id: '3',
      title: 'Deployment Strategies',
      description: 'Best practices for deploying applications',
      category: 'deployment',
      lastUpdated: '2024-01-15',
      url: '/docs/deployment',
    },
    {
      id: '4',
      title: 'Monitoring & Observability',
      description: 'Set up monitoring, logging, and alerting',
      category: 'monitoring',
      lastUpdated: '2024-01-17',
      url: '/docs/monitoring',
    },
    {
      id: '5',
      title: 'API Authentication',
      description: 'Secure your API endpoints with authentication',
      category: 'api',
      lastUpdated: '2024-01-19',
      url: '/docs/api/auth',
    },
    {
      id: '6',
      title: 'Security Best Practices',
      description: 'Secure your nself deployment',
      category: 'security',
      lastUpdated: '2024-01-16',
      url: '/docs/security',
    },
  ])

  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredDocs =
    selectedCategory === 'all'
      ? docs
      : docs.filter((doc) => doc.category === selectedCategory)

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Book className="h-5 w-5" />
        Documentation
      </h2>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            selectedCategory === 'all'
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="h-3 w-3" />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => {
          const category = CATEGORIES.find((c) => c.id === doc.category)
          const Icon = category?.icon || FileText

          return (
            <a
              key={doc.id}
              href={doc.url}
              className="group block rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-blue-700 dark:hover:bg-blue-900/10"
            >
              <div className="mb-3 flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {doc.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {doc.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-blue-500" />
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
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
      description:
        'Complete walkthrough of setting up your first nself project',
      duration: '12:34',
      thumbnail: '/thumbnails/getting-started.jpg',
      category: 'getting-started',
      difficulty: 'beginner',
      views: 15420,
      rating: 4.8,
    },
    {
      id: '2',
      title: 'Advanced Configuration',
      description:
        'Deep dive into advanced configuration options and customization',
      duration: '18:45',
      thumbnail: '/thumbnails/advanced-config.jpg',
      category: 'configuration',
      difficulty: 'advanced',
      views: 8932,
      rating: 4.6,
    },
    {
      id: '3',
      title: 'Monitoring and Alerts Setup',
      description:
        'Set up comprehensive monitoring and alerting for your services',
      duration: '15:20',
      thumbnail: '/thumbnails/monitoring.jpg',
      category: 'monitoring',
      difficulty: 'intermediate',
      views: 12156,
      rating: 4.9,
    },
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'intermediate':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'advanced':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Video className="h-5 w-5" />
        Video Tutorials
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tutorials.map((tutorial) => (
          <div key={tutorial.id} className="group cursor-pointer">
            <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-12 w-12 text-white opacity-80 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {tutorial.duration}
              </div>
            </div>

            <div>
              <h3 className="mb-1 font-medium text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {tutorial.title}
              </h3>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                {tutorial.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs ${getDifficultyColor(tutorial.difficulty)}`}
                  >
                    {tutorial.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="text-xs text-zinc-500">
                      {tutorial.rating}
                    </span>
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
          <ExternalLink className="h-4 w-4" />
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
      answer:
        'You can reset your password by clicking the "Forgot Password" link on the login page, or by using the nself CLI command `nself auth reset-password`.',
      category: 'getting-started',
      helpful: 23,
      notHelpful: 2,
    },
    {
      id: '2',
      question: 'Why is my service not starting?',
      answer:
        'Check the service logs first using `nself logs <service-name>`. Common issues include port conflicts, missing environment variables, or insufficient resources. Verify your configuration and ensure all dependencies are running.',
      category: 'troubleshooting',
      helpful: 45,
      notHelpful: 3,
    },
    {
      id: '3',
      question: 'How do I configure SSL certificates?',
      answer:
        "SSL certificates can be configured through the admin panel under Settings > SSL, or via the CLI using `nself ssl configure`. nself supports both self-signed certificates and Let's Encrypt automatic SSL.",
      category: 'security',
      helpful: 38,
      notHelpful: 1,
    },
    {
      id: '4',
      question: 'Can I use custom domains?',
      answer:
        'Yes! Configure custom domains in the admin panel under Configuration > Domains. Make sure your DNS records point to your nself instance and SSL is properly configured.',
      category: 'configuration',
      helpful: 29,
      notHelpful: 4,
    },
    {
      id: '5',
      question: 'How do I backup my data?',
      answer:
        'Use the backup functionality in Operations > Backup or run `nself backup create` via CLI. This will backup your databases, uploaded files, and configuration. Schedule automatic backups for production use.',
      category: 'deployment',
      helpful: 52,
      notHelpful: 1,
    },
  ])

  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const handleFeedback = async (faqId: string, helpful: boolean) => {
    try {
      await fetch(`/api/help/faq/${faqId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      })
    } catch (error) {
      console.warn('[Help] Error submitting FAQ feedback:', error)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <HelpCircle className="h-5 w-5" />
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <button
              onClick={() =>
                setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
              }
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span className="font-medium">{faq.question}</span>
              {expandedFAQ === faq.id ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedFAQ === faq.id && (
              <div className="px-4 pb-4">
                <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                  {faq.answer}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">
                      Was this helpful?
                    </span>
                    <button
                      onClick={() => handleFeedback(faq.id, true)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {faq.helpful}
                    </button>
                    <button
                      onClick={() => handleFeedback(faq.id, false)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      {faq.notHelpful}
                    </button>
                  </div>

                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    {CATEGORIES.find((c) => c.id === faq.category)?.label}
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
    priority: 'normal',
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
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
          priority: 'normal',
        })
      }
    } catch (_error) {
      // Intentionally empty - form submission errors handled silently
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <MessageCircle className="h-5 w-5" />
        Contact Support
      </h2>

      {submitted ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h3 className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
            Support Request Submitted
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            We&apos;ve received your message and will get back to you within 24
            hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Subject
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Please describe your issue or question in detail..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Message
          </Button>
        </form>
      )}

      <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="mb-3 font-medium">Other Ways to Reach Us</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                support@nself.dev
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm font-medium">Discord</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Join our community
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-sm font-medium">Website</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                nself.dev
              </div>
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
      {
        name: 'File Storage',
        status: 'degraded',
        description: 'Slower than usual response times',
      },
      { name: 'Email Service', status: 'operational' },
      { name: 'Monitoring', status: 'operational' },
    ],
    lastUpdated: new Date().toISOString(),
  })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'operational':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/20',
          icon: CheckCircle,
        }
      case 'degraded':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: AlertCircle,
        }
      case 'down':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          icon: XCircle,
        }
      default:
        return {
          color: 'text-zinc-600 dark:text-zinc-400',
          bg: 'bg-zinc-100 dark:bg-zinc-800',
          icon: Clock,
        }
    }
  }

  const overallConfig = getStatusConfig(status.status)
  const OverallIcon = overallConfig.icon

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Monitor className="h-5 w-5" />
        System Status
      </h2>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <OverallIcon className={`h-6 w-6 ${overallConfig.color}`} />
          <div>
            <h3 className="text-lg font-semibold">
              All Systems{' '}
              {status.status === 'operational'
                ? 'Operational'
                : 'Experiencing Issues'}
            </h3>
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
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50"
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <div>
                  <span className="font-medium">{service.name}</span>
                  {service.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`rounded px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}
              >
                {service.status === 'operational'
                  ? 'Operational'
                  : service.status === 'degraded'
                    ? 'Degraded'
                    : 'Down'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <Button variant="outline" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          View Status Page
        </Button>
      </div>
    </div>
  )
}

function KeyboardShortcutsSection() {
  const shortcuts: KeyboardShortcut[] = [
    {
      keys: ['Ctrl', 'K'],
      description: 'Open command palette',
      category: 'Navigation',
    },
    {
      keys: ['Ctrl', 'Shift', 'P'],
      description: 'Open search',
      category: 'Navigation',
    },
    {
      keys: ['G', 'D'],
      description: 'Go to Dashboard',
      category: 'Navigation',
    },
    { keys: ['G', 'S'], description: 'Go to Services', category: 'Navigation' },
    { keys: ['G', 'L'], description: 'Go to Logs', category: 'Navigation' },
    { keys: ['R'], description: 'Refresh current page', category: 'Actions' },
    {
      keys: ['Ctrl', 'Enter'],
      description: 'Submit form',
      category: 'Actions',
    },
    { keys: ['Esc'], description: 'Close modal/dialog', category: 'Actions' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'Help' },
    { keys: ['Ctrl', '/'], description: 'Toggle help panel', category: 'Help' },
  ]

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = []
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, KeyboardShortcut[]>,
  )

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Keyboard className="h-5 w-5" />
        Keyboard Shortcuts
      </h2>

      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
          <div key={category}>
            <h3 className="mb-3 font-medium text-zinc-900 dark:text-white">
              {category}
            </h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd className="rounded border bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
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
  const [activeTab, setActiveTab] = useState<
    'overview' | 'docs' | 'faq' | 'contact'
  >('overview')

  return (
    <>
      <HeroPattern />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Help & Support
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Find answers, learn best practices, and get support for your nself
            deployment
          </p>
        </div>

        <div className="mb-8 flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'docs', label: 'Documentation', icon: Book },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'contact', label: 'Contact Support', icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <SearchSection />

            <div className="grid gap-8 lg:grid-cols-2">
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
