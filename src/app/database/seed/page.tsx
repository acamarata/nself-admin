'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Code2,
  CreditCard,
  Eye,
  FileText,
  GitBranch,
  Loader2,
  Package,
  Play,
  RefreshCw,
  Save,
  Settings,
  Upload,
  Users,
  Wand2,
  XCircle,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SeedTemplate {
  id: string
  name: string
  description: string
  table: string
  category: 'users' | 'content' | 'commerce' | 'system' | 'custom'
  fields: SeedField[]
  relationships?: string[]
  sampleData: any[]
}

interface SeedField {
  name: string
  type: 'faker' | 'static' | 'sequence' | 'random' | 'reference'
  fakerMethod?: string
  staticValue?: any
  sequenceStart?: number
  randomOptions?: any[]
  referenceTable?: string
  referenceField?: string
  nullable?: boolean
}

interface SeedJob {
  id: string
  name: string
  table: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  recordCount: number
  progress: number
  createdAt: string
  completedAt?: string
  error?: string
  template?: SeedTemplate
}

interface ImportData {
  fileName: string
  format: 'csv' | 'json' | 'sql'
  table: string
  records: any[]
  mapping: Record<string, string>
}

export default function DatabaseSeedPage() {
  const [seedJobs, setSeedJobs] = useState<SeedJob[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<SeedTemplate | null>(
    null,
  )
  const [customSeedData, setCustomSeedData] = useState('')
  const [selectedTable, setSelectedTable] = useState('users')
  const [recordCount, setRecordCount] = useState(100)
  const [isSeeding, setIsSeeding] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tables = [
    'users',
    'posts',
    'comments',
    'categories',
    'orders',
    'products',
    'user_profiles',
  ]

  const seedTemplates: SeedTemplate[] = [
    {
      id: '1',
      name: 'User Profiles',
      description: 'Generate realistic user profiles with personal information',
      table: 'users',
      category: 'users',
      fields: [
        { name: 'email', type: 'faker', fakerMethod: 'internet.email' },
        { name: 'name', type: 'faker', fakerMethod: 'person.fullName' },
        { name: 'username', type: 'faker', fakerMethod: 'internet.userName' },
        { name: 'bio', type: 'faker', fakerMethod: 'lorem.paragraph' },
        { name: 'avatar_url', type: 'faker', fakerMethod: 'image.avatar' },
        { name: 'phone', type: 'faker', fakerMethod: 'phone.number' },
        { name: 'location', type: 'faker', fakerMethod: 'location.city' },
        { name: 'is_verified', type: 'random', randomOptions: [true, false] },
        { name: 'created_at', type: 'faker', fakerMethod: 'date.past' },
      ],
      sampleData: [
        {
          email: 'john@example.com',
          name: 'John Doe',
          username: 'johndoe',
          bio: 'Software developer passionate about technology',
        },
        {
          email: 'jane@example.com',
          name: 'Jane Smith',
          username: 'janesmith',
          bio: 'Designer and photographer',
        },
      ],
    },
    {
      id: '2',
      name: 'Blog Posts',
      description: 'Create blog posts with titles, content, and metadata',
      table: 'posts',
      category: 'content',
      fields: [
        { name: 'title', type: 'faker', fakerMethod: 'lorem.sentence' },
        { name: 'content', type: 'faker', fakerMethod: 'lorem.paragraphs' },
        { name: 'slug', type: 'faker', fakerMethod: 'lorem.slug' },
        { name: 'excerpt', type: 'faker', fakerMethod: 'lorem.paragraph' },
        { name: 'featured_image', type: 'faker', fakerMethod: 'image.url' },
        { name: 'published', type: 'random', randomOptions: [true, false] },
        {
          name: 'view_count',
          type: 'faker',
          fakerMethod: 'number.int',
          randomOptions: [0, 10000],
        },
        {
          name: 'user_id',
          type: 'reference',
          referenceTable: 'users',
          referenceField: 'id',
        },
        { name: 'created_at', type: 'faker', fakerMethod: 'date.past' },
      ],
      relationships: ['users'],
      sampleData: [
        {
          title: 'Getting Started with React',
          content: 'React is a powerful library...',
          published: true,
        },
        {
          title: 'Database Design Patterns',
          content: 'When designing databases...',
          published: false,
        },
      ],
    },
    {
      id: '3',
      name: 'E-commerce Products',
      description: 'Generate product catalog with pricing and inventory',
      table: 'products',
      category: 'commerce',
      fields: [
        { name: 'name', type: 'faker', fakerMethod: 'commerce.productName' },
        {
          name: 'description',
          type: 'faker',
          fakerMethod: 'commerce.productDescription',
        },
        { name: 'price', type: 'faker', fakerMethod: 'commerce.price' },
        { name: 'sku', type: 'faker', fakerMethod: 'string.alphanumeric' },
        { name: 'category', type: 'faker', fakerMethod: 'commerce.department' },
        { name: 'in_stock', type: 'random', randomOptions: [true, false] },
        {
          name: 'stock_quantity',
          type: 'faker',
          fakerMethod: 'number.int',
          randomOptions: [0, 1000],
        },
        { name: 'image_url', type: 'faker', fakerMethod: 'image.url' },
        { name: 'weight', type: 'faker', fakerMethod: 'number.float' },
        { name: 'created_at', type: 'faker', fakerMethod: 'date.past' },
      ],
      sampleData: [
        {
          name: 'Wireless Headphones',
          price: 99.99,
          sku: 'WH001',
          category: 'Electronics',
        },
        {
          name: 'Coffee Mug',
          price: 12.99,
          sku: 'CM001',
          category: 'Home & Garden',
        },
      ],
    },
    {
      id: '4',
      name: 'Customer Orders',
      description: 'Generate order history with line items and totals',
      table: 'orders',
      category: 'commerce',
      fields: [
        {
          name: 'order_number',
          type: 'faker',
          fakerMethod: 'string.alphanumeric',
        },
        { name: 'total_amount', type: 'faker', fakerMethod: 'commerce.price' },
        {
          name: 'status',
          type: 'random',
          randomOptions: [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
          ],
        },
        {
          name: 'shipping_address',
          type: 'faker',
          fakerMethod: 'location.streetAddress',
        },
        {
          name: 'payment_method',
          type: 'random',
          randomOptions: ['credit_card', 'paypal', 'bank_transfer'],
        },
        {
          name: 'user_id',
          type: 'reference',
          referenceTable: 'users',
          referenceField: 'id',
        },
        { name: 'created_at', type: 'faker', fakerMethod: 'date.past' },
      ],
      relationships: ['users'],
      sampleData: [
        { order_number: 'ORD-001', total_amount: 129.98, status: 'delivered' },
        { order_number: 'ORD-002', total_amount: 49.99, status: 'processing' },
      ],
    },
  ]

  useEffect(() => {
    // Mock existing seed jobs
    setSeedJobs([
      {
        id: '1',
        name: 'User Seed - Development',
        table: 'users',
        status: 'completed',
        recordCount: 1000,
        progress: 100,
        createdAt: '2024-01-15 10:30:00',
        completedAt: '2024-01-15 10:32:15',
      },
      {
        id: '2',
        name: 'Product Catalog Seed',
        table: 'products',
        status: 'completed',
        recordCount: 500,
        progress: 100,
        createdAt: '2024-01-15 11:15:00',
        completedAt: '2024-01-15 11:16:45',
      },
      {
        id: '3',
        name: 'Blog Posts Seed',
        table: 'posts',
        status: 'failed',
        recordCount: 200,
        progress: 45,
        createdAt: '2024-01-15 14:20:00',
        error: 'Foreign key constraint failed - user_id reference not found',
      },
    ])
  }, [])

  const generatePreview = (template: SeedTemplate, count: number = 5) => {
    // Mock preview data generation
    const preview = []
    for (let i = 0; i < Math.min(count, 5); i++) {
      const record: any = {}
      template.fields.forEach((field) => {
        switch (field.type) {
          case 'faker':
            switch (field.fakerMethod) {
              case 'internet.email':
                record[field.name] = `user${i + 1}@example.com`
                break
              case 'person.fullName':
                record[field.name] = [
                  'John Doe',
                  'Jane Smith',
                  'Bob Wilson',
                  'Alice Johnson',
                  'Charlie Brown',
                ][i]
                break
              case 'lorem.sentence':
                record[field.name] = 'Lorem ipsum dolor sit amet consectetur'
                break
              case 'commerce.price':
                record[field.name] = (Math.random() * 100 + 10).toFixed(2)
                break
              case 'number.int':
                record[field.name] = Math.floor(Math.random() * 1000)
                break
              default:
                record[field.name] = `mock_${field.fakerMethod}_${i + 1}`
            }
            break
          case 'static':
            record[field.name] = field.staticValue
            break
          case 'sequence':
            record[field.name] = (field.sequenceStart || 1) + i
            break
          case 'random':
            record[field.name] =
              field.randomOptions?.[
                Math.floor(Math.random() * field.randomOptions.length)
              ]
            break
          case 'reference':
            record[field.name] = Math.floor(Math.random() * 100) + 1
            break
        }
      })
      preview.push(record)
    }
    setPreviewData(preview)
  }

  const runSeedJob = async (template: SeedTemplate, count: number) => {
    setIsSeeding(true)

    const newJob: SeedJob = {
      id: Date.now().toString(),
      name: `${template.name} - ${new Date().toLocaleString()}`,
      table: template.table,
      status: 'running',
      recordCount: count,
      progress: 0,
      createdAt: new Date().toLocaleString(),
      template,
    }

    setSeedJobs((prev) => [newJob, ...prev])

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setSeedJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id ? { ...job, progress: i } : job,
        ),
      )
    }

    // Complete the job
    setSeedJobs((prev) =>
      prev.map((job) =>
        job.id === newJob.id
          ? {
              ...job,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date().toLocaleString(),
            }
          : job,
      ),
    )

    setIsSeeding(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      let records: any[] = []
      let format: 'csv' | 'json' | 'sql' = 'csv'

      try {
        if (file.name.endsWith('.json')) {
          format = 'json'
          records = JSON.parse(content)
        } else if (file.name.endsWith('.csv')) {
          format = 'csv'
          const lines = content.split('\n')
          const headers = lines[0].split(',').map((h) => h.trim())
          records = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line) => {
              const values = line.split(',').map((v) => v.trim())
              const record: any = {}
              headers.forEach((header, index) => {
                record[header] = values[index] || ''
              })
              return record
            })
        }

        setImportData({
          fileName: file.name,
          format,
          table: selectedTable,
          records: records.slice(0, 1000), // Limit to 1000 records for preview
          mapping: {},
        })
        setShowImportDialog(true)
      } catch (error) {}
    }
    reader.readAsText(file)
  }

  const executeImport = async () => {
    if (!importData) return

    setIsSeeding(true)
    setShowImportDialog(false)

    const newJob: SeedJob = {
      id: Date.now().toString(),
      name: `Import ${importData.fileName}`,
      table: importData.table,
      status: 'running',
      recordCount: importData.records.length,
      progress: 0,
      createdAt: new Date().toLocaleString(),
    }

    setSeedJobs((prev) => [newJob, ...prev])

    // Simulate import progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSeedJobs((prev) =>
        prev.map((job) =>
          job.id === newJob.id ? { ...job, progress: i } : job,
        ),
      )
    }

    setSeedJobs((prev) =>
      prev.map((job) =>
        job.id === newJob.id
          ? {
              ...job,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date().toLocaleString(),
            }
          : job,
      ),
    )

    setImportData(null)
    setIsSeeding(false)
  }

  const getStatusIcon = (status: SeedJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: SeedJob['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'running':
        return 'text-blue-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <PageTemplate description="Generate test data, import datasets, and manage database seeding operations">
      <div className="space-y-6">
        {/* Seeding Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    Seed Data Management
                  </CardTitle>
                </div>

                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table} value={table}>
                        {table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.sql"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Seed</TabsTrigger>
            <TabsTrigger value="jobs">Seed Jobs</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>

          {/* Seed Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Template List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Seed Templates</CardTitle>
                    <CardDescription>
                      Pre-built templates for common data patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {seedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={cn(
                            'cursor-pointer rounded border p-4 transition-colors',
                            selectedTemplate?.id === template.id
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                          )}
                          onClick={() => {
                            setSelectedTemplate(template)
                            generatePreview(template)
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {template.category === 'users' && (
                                <Users className="h-4 w-4" />
                              )}
                              {template.category === 'content' && (
                                <FileText className="h-4 w-4" />
                              )}
                              {template.category === 'commerce' && (
                                <CreditCard className="h-4 w-4" />
                              )}
                              {template.category === 'system' && (
                                <Settings className="h-4 w-4" />
                              )}
                              <span className="font-medium">
                                {template.name}
                              </span>
                            </div>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>

                          <p className="text-muted-foreground mb-3 text-sm">
                            {template.description}
                          </p>

                          <div className="text-muted-foreground flex items-center justify-between text-xs">
                            <span>Table: {template.table}</span>
                            <span>{template.fields.length} fields</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Template Preview & Controls */}
              <div>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Preview Data
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={recordCount}
                              onChange={(e) =>
                                setRecordCount(Number(e.target.value))
                              }
                              className="w-24"
                              min="1"
                              max="10000"
                            />
                            <span className="text-muted-foreground text-sm">
                              records
                            </span>
                            <Button
                              variant="outline"
                              onClick={() => generatePreview(selectedTemplate)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>

                          <ScrollArea className="h-64">
                            <div className="space-y-2">
                              {previewData.map((record, index) => (
                                <div
                                  key={index}
                                  className="rounded bg-gray-50 p-2 text-xs dark:bg-gray-800"
                                >
                                  <pre>{JSON.stringify(record, null, 2)}</pre>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>

                          <Button
                            className="w-full"
                            onClick={() =>
                              runSeedJob(selectedTemplate, recordCount)
                            }
                            disabled={isSeeding}
                          >
                            {isSeeding ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Seeding...
                              </>
                            ) : (
                              <>
                                <Zap className="mr-2 h-4 w-4" />
                                Generate Data
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Field Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {selectedTemplate.fields.map((field, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="font-medium">
                                  {field.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {field.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Wand2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <p className="text-muted-foreground">
                        Select a template to preview and generate data
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Custom Seed */}
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Custom Seed Script
                </CardTitle>
                <CardDescription>
                  Write custom SQL or JavaScript to generate specific data
                  patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Target Table
                    </label>
                    <Select
                      value={selectedTable}
                      onValueChange={setSelectedTable}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table} value={table}>
                            {table}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Record Count
                    </label>
                    <Input
                      type="number"
                      value={recordCount}
                      onChange={(e) => setRecordCount(Number(e.target.value))}
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Batch Size
                    </label>
                    <Input
                      type="number"
                      defaultValue="100"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Seed Script
                  </label>
                  <Textarea
                    value={customSeedData}
                    onChange={(e) => setCustomSeedData(e.target.value)}
                    placeholder={`-- SQL Example:
INSERT INTO users (name, email, created_at) VALUES
  (faker.name(), faker.email(), NOW()),
  (faker.name(), faker.email(), NOW());

-- JavaScript Example:
for (let i = 0; i < count; i++) {
  yield {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    created_at: new Date()
  }
}`}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline">
                      <Save className="mr-2 h-4 w-4" />
                      Save Template
                    </Button>
                  </div>

                  <Button disabled={!customSeedData.trim() || isSeeding}>
                    {isSeeding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Execute Script
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Button
                    variant="outline"
                    className="h-auto justify-start p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Clear Table</div>
                      <div className="text-muted-foreground text-xs">
                        Remove all data
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto justify-start p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Truncate & Seed</div>
                      <div className="text-muted-foreground text-xs">
                        Reset and populate
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto justify-start p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Export Schema</div>
                      <div className="text-muted-foreground text-xs">
                        Download structure
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto justify-start p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Backup Data</div>
                      <div className="text-muted-foreground text-xs">
                        Create backup
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seed Jobs */}
          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Seeding History
                </CardTitle>
                <CardDescription>
                  Track all seeding operations and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {seedJobs.map((job) => (
                      <div key={job.id} className="rounded border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{job.name}</span>
                                <Badge variant="outline">{job.table}</Badge>
                              </div>
                              <p className="text-muted-foreground mt-1 text-sm">
                                {job.recordCount.toLocaleString()} records
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={cn(
                                'text-sm font-medium',
                                getStatusColor(job.status),
                              )}
                            >
                              {job.status.toUpperCase()}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              {job.status === 'running' && `${job.progress}%`}
                              {job.completedAt &&
                                `Completed ${job.completedAt}`}
                              {job.error && 'Failed'}
                            </div>
                          </div>
                        </div>

                        {job.status === 'running' && (
                          <div className="mt-3">
                            <div className="mb-1 flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {job.error && (
                          <Alert className="mt-3" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{job.error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                          <span>Started {job.createdAt}</span>
                          {job.template && (
                            <span>Template: {job.template.name}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relationships */}
          <TabsContent value="relationships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Table Relationships
                </CardTitle>
                <CardDescription>
                  Understand foreign key relationships for proper seeding order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Seeding Order</AlertTitle>
                    <AlertDescription>
                      Tables with foreign key dependencies should be seeded in
                      the correct order to avoid constraint violations.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded border p-4">
                      <h4 className="mb-3 font-medium">Dependency Graph</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-green-500" />
                          <span>users (no dependencies)</span>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-blue-500" />
                          <span>user_profiles → users</span>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-blue-500" />
                          <span>posts → users</span>
                        </div>
                        <div className="ml-8 flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-orange-500" />
                          <span>comments → posts, users</span>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-blue-500" />
                          <span>orders → users</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded border p-4">
                      <h4 className="mb-3 font-medium">Recommended Order</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>1. users</span>
                          <Badge variant="outline">0 deps</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>2. categories</span>
                          <Badge variant="outline">0 deps</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>3. products</span>
                          <Badge variant="outline">0 deps</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>4. user_profiles</span>
                          <Badge variant="outline">1 dep</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>5. posts</span>
                          <Badge variant="outline">1 dep</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>6. orders</span>
                          <Badge variant="outline">1 dep</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>7. comments</span>
                          <Badge variant="outline">2 deps</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Import Dialog */}
        {showImportDialog && importData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="m-4 w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Import Data Preview</CardTitle>
                <CardDescription>
                  {importData.fileName} - {importData.records.length} records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Target Table
                    </label>
                    <Select
                      value={importData.table}
                      onValueChange={(table) =>
                        setImportData((prev) =>
                          prev ? { ...prev, table } : null,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table} value={table}>
                            {table}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Format
                    </label>
                    <Badge variant="outline">
                      {importData.format.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">
                    Preview (first 5 records)
                  </h4>
                  <ScrollArea className="h-48">
                    <pre className="rounded bg-gray-100 p-3 text-xs dark:bg-gray-800">
                      {JSON.stringify(importData.records.slice(0, 5), null, 2)}
                    </pre>
                  </ScrollArea>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowImportDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={executeImport}>
                    Import {importData.records.length} Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTemplate>
  )
}
