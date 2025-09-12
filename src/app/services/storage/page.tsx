'use client'

import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Copy,
  Database,
  Download,
  Edit3,
  Eye,
  File,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Grid,
  HardDrive,
  Image,
  List,
  Lock,
  MoreVertical,
  Music,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share,
  Shield,
  Trash2,
  Unlock,
  Upload,
  Video,
} from 'lucide-react'
import { useState } from 'react'

interface StorageObject {
  id: string
  name: string
  type: 'file' | 'folder'
  size: number
  lastModified: string
  owner: string
  permissions: string
  bucket: string
  path: string
  contentType?: string
  etag?: string
  isPublic: boolean
  thumbnail?: string
}

interface Bucket {
  id: string
  name: string
  creationDate: string
  policy: 'private' | 'public-read' | 'public-read-write'
  objectCount: number
  totalSize: number
  region: string
  versioning: boolean
  encryption: boolean
  notifications: boolean
}

interface StoragePolicy {
  id: string
  name: string
  bucket: string
  effect: 'Allow' | 'Deny'
  actions: string[]
  resources: string[]
  conditions?: Record<string, any>
  principal: string
}

const mockBuckets: Bucket[] = [
  {
    id: '1',
    name: 'nself-uploads',
    creationDate: '2024-01-01T00:00:00Z',
    policy: 'private',
    objectCount: 1247,
    totalSize: 5.2 * 1024 * 1024 * 1024, // 5.2GB
    region: 'us-east-1',
    versioning: true,
    encryption: true,
    notifications: false,
  },
  {
    id: '2',
    name: 'nself-static',
    creationDate: '2024-01-01T00:00:00Z',
    policy: 'public-read',
    objectCount: 89,
    totalSize: 256 * 1024 * 1024, // 256MB
    region: 'us-east-1',
    versioning: false,
    encryption: false,
    notifications: true,
  },
  {
    id: '3',
    name: 'nself-backups',
    creationDate: '2024-01-01T00:00:00Z',
    policy: 'private',
    objectCount: 45,
    totalSize: 12.8 * 1024 * 1024 * 1024, // 12.8GB
    region: 'us-east-1',
    versioning: true,
    encryption: true,
    notifications: true,
  },
]

const mockObjects: StorageObject[] = [
  {
    id: '1',
    name: 'documents',
    type: 'folder',
    size: 0,
    lastModified: '2024-01-15T10:30:00Z',
    owner: 'admin',
    permissions: 'rwx',
    bucket: 'nself-uploads',
    path: '/documents',
    isPublic: false,
  },
  {
    id: '2',
    name: 'user-profile.png',
    type: 'file',
    size: 1024 * 512, // 512KB
    lastModified: '2024-01-15T08:45:00Z',
    owner: 'admin',
    permissions: 'rw-',
    bucket: 'nself-uploads',
    path: '/images/user-profile.png',
    contentType: 'image/png',
    etag: 'abc123def456',
    isPublic: false,
    thumbnail: '/api/thumbnails/user-profile.png',
  },
  {
    id: '3',
    name: 'presentation.pdf',
    type: 'file',
    size: 1024 * 1024 * 2.5, // 2.5MB
    lastModified: '2024-01-14T16:20:00Z',
    owner: 'john.doe',
    permissions: 'r--',
    bucket: 'nself-uploads',
    path: '/documents/presentation.pdf',
    contentType: 'application/pdf',
    etag: 'def456ghi789',
    isPublic: true,
  },
  {
    id: '4',
    name: 'demo-video.mp4',
    type: 'file',
    size: 1024 * 1024 * 45, // 45MB
    lastModified: '2024-01-13T14:15:00Z',
    owner: 'jane.smith',
    permissions: 'rw-',
    bucket: 'nself-uploads',
    path: '/media/demo-video.mp4',
    contentType: 'video/mp4',
    etag: 'ghi789jkl012',
    isPublic: false,
  },
]

const mockPolicies: StoragePolicy[] = [
  {
    id: '1',
    name: 'Public Read Access',
    bucket: 'nself-static',
    effect: 'Allow',
    actions: ['s3:GetObject'],
    resources: ['arn:aws:s3:::nself-static/*'],
    principal: '*',
  },
  {
    id: '2',
    name: 'Admin Full Access',
    bucket: 'nself-uploads',
    effect: 'Allow',
    actions: ['s3:*'],
    resources: ['arn:aws:s3:::nself-uploads/*'],
    principal: 'arn:aws:iam::123456789:user/admin',
  },
  {
    id: '3',
    name: 'Read-Only Access',
    bucket: 'nself-backups',
    effect: 'Allow',
    actions: ['s3:GetObject', 's3:ListBucket'],
    resources: ['arn:aws:s3:::nself-backups/*'],
    principal: 'arn:aws:iam::123456789:role/backup-reader',
  },
]

function formatSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function getFileIcon(object: StorageObject) {
  if (object.type === 'folder') return Folder

  const ext = object.name.split('.').pop()?.toLowerCase()
  const contentType = object.contentType?.toLowerCase()

  if (contentType?.startsWith('image/')) return Image
  if (contentType?.startsWith('video/')) return Video
  if (contentType?.startsWith('audio/')) return Music
  if (ext === 'pdf' || contentType?.includes('pdf')) return FileText
  if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) return Archive

  return File
}

function BucketCard({
  bucket,
  onAction,
}: {
  bucket: Bucket
  onAction: (action: string, id: string) => void
}) {
  const policyConfig = {
    private: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      icon: Lock,
    },
    'public-read': {
      color:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      icon: Eye,
    },
    'public-read-write': {
      color:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: Unlock,
    },
  }

  const config = policyConfig[bucket.policy]
  const PolicyIcon = config.icon

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
            <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {bucket.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
              >
                {bucket.policy}
              </span>
              <PolicyIcon className="h-3 w-3 text-zinc-500" />
            </div>
          </div>
        </div>

        <div className="group relative">
          <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700">
            <MoreVertical className="h-4 w-4" />
          </button>
          <div className="invisible absolute right-0 z-10 mt-1 w-48 rounded-lg border border-zinc-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              onClick={() => onAction('browse', bucket.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <FolderOpen className="h-4 w-4" />
              Browse
            </button>
            <button
              onClick={() => onAction('policy', bucket.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <Shield className="h-4 w-4" />
              Manage Policy
            </button>
            <button
              onClick={() => onAction('settings', bucket.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
            <button
              onClick={() => onAction('delete', bucket.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Objects</span>
            <p className="font-medium">{bucket.objectCount.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Size</span>
            <p className="font-medium">{formatSize(bucket.totalSize)}</p>
          </div>
        </div>

        <div className="text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Created: </span>
          <span className="font-medium">{formatDate(bucket.creationDate)}</span>
        </div>

        <div className="text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Region: </span>
          <span className="font-medium">{bucket.region}</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {bucket.versioning && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              Versioning
            </div>
          )}
          {bucket.encryption && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Shield className="h-3 w-3" />
              Encrypted
            </div>
          )}
          {bucket.notifications && (
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <AlertCircle className="h-3 w-3" />
              Notifications
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ObjectRow({
  object,
  onAction,
}: {
  object: StorageObject
  onAction: (action: string, object: StorageObject) => void
}) {
  const Icon = getFileIcon(object)

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">
              {object.name}
            </div>
            <div className="text-xs text-zinc-500">{object.path}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {object.type === 'file' ? formatSize(object.size) : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {formatDate(object.lastModified)}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {object.owner}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-700">
            {object.permissions}
          </span>
          {object.isPublic && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Globe className="h-3 w-3" />
              <span className="text-xs">Public</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAction('download', object)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <Download className="h-3 w-3" />
          </button>
          <button
            onClick={() => onAction('share', object)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <Share className="h-3 w-3" />
          </button>
          <button
            onClick={() => onAction('edit', object)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => onAction('delete', object)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function PolicyCard({
  policy,
  onAction,
}: {
  policy: StoragePolicy
  onAction: (action: string, id: string) => void
}) {
  const effectConfig = {
    Allow: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    Deny: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  }

  const config = effectConfig[policy.effect]

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {policy.name}
          </h3>
          <p className="text-sm text-zinc-500">{policy.bucket}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}
          >
            {policy.effect}
          </span>
          <div className="group relative">
            <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <MoreVertical className="h-3 w-3" />
            </button>
            <div className="invisible absolute right-0 z-10 mt-1 w-32 rounded-lg border border-zinc-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => onAction('edit', policy.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => onAction('copy', policy.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <button
                onClick={() => onAction('delete', policy.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Actions: </span>
          <span className="font-medium">{policy.actions.join(', ')}</span>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Principal: </span>
          <span className="font-mono text-xs font-medium">
            {policy.principal}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 dark:text-zinc-400">Resources: </span>
          <span className="font-mono text-xs font-medium">
            {policy.resources[0]}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function StoragePage() {
  const [buckets, setBuckets] = useState<Bucket[]>(mockBuckets)
  const [objects, setObjects] = useState<StorageObject[]>(mockObjects)
  const [policies, setPolicies] = useState<StoragePolicy[]>(mockPolicies)
  const [activeTab, setActiveTab] = useState<
    'buckets' | 'browser' | 'policies'
  >('buckets')
  const [selectedBucket, setSelectedBucket] = useState<string>('nself-uploads')
  const [currentPath, setCurrentPath] = useState<string>('/')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [loading, setLoading] = useState(false)

  const handleBucketAction = async (action: string, id: string) => {
    if (action === 'browse') {
      setSelectedBucket(id)
      setActiveTab('browser')
    }
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const handleObjectAction = async (action: string, object: StorageObject) => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const handlePolicyAction = async (action: string, id: string) => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const filteredObjects = objects.filter((obj) => {
    if (obj.bucket !== selectedBucket) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        obj.name.toLowerCase().includes(query) ||
        obj.path.toLowerCase().includes(query)
      )
    }
    return true
  })

  const stats = {
    totalBuckets: buckets.length,
    totalObjects: buckets.reduce((acc, b) => acc + b.objectCount, 0),
    totalSize: buckets.reduce((acc, b) => acc + b.totalSize, 0),
    publicBuckets: buckets.filter((b) => b.policy !== 'private').length,
  }

  return (
    <>
      <HeroPattern />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Storage Manager
              </h1>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                MinIO object storage management with bucket browser and access
                policies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="filled" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Bucket
              </Button>
              <Button
                onClick={() => setLoading(!loading)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Buckets
                  </p>
                  <p className="text-2xl font-bold">{stats.totalBuckets}</p>
                </div>
                <HardDrive className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Objects
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.totalObjects.toLocaleString()}
                  </p>
                </div>
                <File className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Size
                  </p>
                  <p className="text-lg font-bold">
                    {formatSize(stats.totalSize)}
                  </p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Public
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.publicBuckets}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-zinc-200 dark:border-zinc-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('buckets')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'buckets'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Buckets ({buckets.length})
              </button>
              <button
                onClick={() => setActiveTab('browser')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'browser'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                File Browser
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'policies'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Policies ({policies.length})
              </button>
            </nav>
          </div>

          {/* Search and Controls */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'browser' ? 'Search files...' : 'Search...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-4 pl-10 dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              {activeTab === 'browser' && (
                <select
                  value={selectedBucket}
                  onChange={(e) => setSelectedBucket(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {buckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {activeTab === 'browser' && (
              <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'buckets' && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {buckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                onAction={handleBucketAction}
              />
            ))}
          </div>
        )}

        {activeTab === 'browser' && (
          <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <HardDrive className="h-4 w-4" />
              <span>{buckets.find((b) => b.id === selectedBucket)?.name}</span>
              <span>/</span>
              <span>{currentPath}</span>
            </div>

            {/* File List */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Modified
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Permissions
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {filteredObjects.map((object) => (
                      <ObjectRow
                        key={object.id}
                        object={object}
                        onAction={handleObjectAction}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Access Policies
              </h2>
              <Button variant="filled" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Policy
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {policies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onAction={handlePolicyAction}
                />
              ))}
            </div>

            {/* Policy JSON Editor */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Policy Editor
              </h3>
              <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                <pre className="overflow-x-auto text-sm text-zinc-700 dark:text-zinc-300">
                  {`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::nself-static/*"]
    }
  ]
}`}
                </pre>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="filled" className="text-sm">
                  Apply Policy
                </Button>
                <Button variant="outline" className="text-sm">
                  Validate
                </Button>
                <Button variant="outline" className="text-sm">
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
