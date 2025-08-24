'use client'

import { useState, useEffect } from 'react'
import { PageTemplate } from '@/components/PageTemplate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Database, Play, Square, Clock, Download, Save, FileText, 
  History, Plus, X, Copy, Settings, Search, RefreshCw,
  ChevronRight, Table, Columns, GitBranch, AlertCircle,
  CheckCircle, XCircle, Loader2, MoreHorizontal, Edit,
  Trash2, ArrowUp, ArrowDown, GitCommit, Code2,
  Zap, Eye, Users, Calendar, Filter, FileCode
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Migration {
  id: string
  version: string
  name: string
  description: string
  status: 'pending' | 'applied' | 'failed' | 'rolled_back'
  appliedAt?: string
  rolledBackAt?: string
  executionTime?: number
  upSql: string
  downSql: string
  author: string
  checksum: string
  batch?: number
}

interface SchemaDiff {
  type: 'table' | 'column' | 'index' | 'constraint'
  action: 'add' | 'modify' | 'drop'
  target: string
  before?: any
  after?: any
  sql: string
}

interface MigrationTemplate {
  id: string
  name: string
  description: string
  template: string
  category: 'table' | 'column' | 'index' | 'data' | 'custom'
}

export default function DatabaseMigrationsPage() {
  const [migrations, setMigrations] = useState<Migration[]>([])
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null)
  const [schemaDiff, setSchemaDiff] = useState<SchemaDiff[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [newMigrationName, setNewMigrationName] = useState('')
  const [newMigrationDescription, setNewMigrationDescription] = useState('')
  const [newMigrationSql, setNewMigrationSql] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [templates, setTemplates] = useState<MigrationTemplate[]>([])

  useEffect(() => {
    // Mock migration data
    setMigrations([
      {
        id: '1',
        version: '20240115_001',
        name: 'create_users_table',
        description: 'Create users table with basic fields',
        status: 'applied',
        appliedAt: '2024-01-15 10:30:00',
        executionTime: 45,
        upSql: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
        downSql: 'DROP TABLE IF EXISTS users;',
        author: 'john.doe@example.com',
        checksum: 'abc123def456',
        batch: 1
      },
      {
        id: '2',
        version: '20240115_002',
        name: 'add_user_profiles_table',
        description: 'Create user profiles table for additional user data',
        status: 'applied',
        appliedAt: '2024-01-15 11:15:00',
        executionTime: 32,
        upSql: `CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url VARCHAR(500),
  location VARCHAR(255),
  website VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
        downSql: 'DROP TABLE IF EXISTS user_profiles;',
        author: 'jane.smith@example.com',
        checksum: 'def456ghi789',
        batch: 2
      },
      {
        id: '3',
        version: '20240115_003',
        name: 'add_posts_table',
        description: 'Create posts table for user content',
        status: 'applied',
        appliedAt: '2024-01-15 14:20:00',
        executionTime: 67,
        upSql: `CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_slug ON posts(slug);`,
        downSql: `DROP INDEX IF EXISTS idx_posts_slug;
DROP INDEX IF EXISTS idx_posts_published;
DROP INDEX IF EXISTS idx_posts_user_id;
DROP TABLE IF EXISTS posts;`,
        author: 'bob.wilson@example.com',
        checksum: 'ghi789jkl012',
        batch: 3
      },
      {
        id: '4',
        version: '20240116_001',
        name: 'add_email_verification',
        description: 'Add email verification fields to users table',
        status: 'pending',
        upSql: `ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN email_verification_token VARCHAR(255),
ADD COLUMN email_verification_expires_at TIMESTAMP;

CREATE INDEX idx_users_verification_token ON users(email_verification_token);`,
        downSql: `DROP INDEX IF EXISTS idx_users_verification_token;

ALTER TABLE users 
DROP COLUMN IF EXISTS email_verification_expires_at,
DROP COLUMN IF EXISTS email_verification_token,
DROP COLUMN IF EXISTS email_verified;`,
        author: 'alice.johnson@example.com',
        checksum: 'jkl012mno345'
      },
      {
        id: '5',
        version: '20240116_002',
        name: 'create_categories_table',
        description: 'Create categories table for organizing posts',
        status: 'failed',
        executionTime: 0,
        upSql: `CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- This will fail due to duplicate slug
INSERT INTO categories (name, slug) VALUES ('Tech', 'tech');
INSERT INTO categories (name, slug) VALUES ('Technology', 'tech');`,
        downSql: 'DROP TABLE IF EXISTS categories;',
        author: 'charlie.brown@example.com',
        checksum: 'mno345pqr678'
      }
    ])

    // Mock schema diff
    setSchemaDiff([
      {
        type: 'table',
        action: 'add',
        target: 'notifications',
        sql: 'CREATE TABLE notifications (...)',
        after: { name: 'notifications', columns: ['id', 'user_id', 'title', 'message'] }
      },
      {
        type: 'column',
        action: 'add',
        target: 'users.phone',
        sql: 'ALTER TABLE users ADD COLUMN phone VARCHAR(20)',
        after: { name: 'phone', type: 'VARCHAR(20)', nullable: true }
      },
      {
        type: 'index',
        action: 'modify',
        target: 'idx_posts_title',
        sql: 'DROP INDEX idx_posts_title; CREATE INDEX idx_posts_title_gin ON posts USING gin(to_tsvector(\'english\', title))',
        before: { type: 'btree', columns: ['title'] },
        after: { type: 'gin', columns: ['to_tsvector(title)'] }
      }
    ])

    // Mock migration templates
    setTemplates([
      {
        id: '1',
        name: 'Create Table',
        description: 'Basic table creation template',
        category: 'table',
        template: `CREATE TABLE table_name (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
      },
      {
        id: '2',
        name: 'Add Column',
        description: 'Add a new column to existing table',
        category: 'column',
        template: `ALTER TABLE table_name 
ADD COLUMN column_name data_type;`
      },
      {
        id: '3',
        name: 'Create Index',
        description: 'Create index for better performance',
        category: 'index',
        template: `CREATE INDEX idx_table_column 
ON table_name (column_name);`
      },
      {
        id: '4',
        name: 'Add Foreign Key',
        description: 'Add foreign key constraint',
        category: 'table',
        template: `ALTER TABLE table_name 
ADD CONSTRAINT fk_table_reference 
FOREIGN KEY (column_id) REFERENCES reference_table(id);`
      }
    ])
  }, [])

  const filteredMigrations = migrations.filter(migration => 
    filterStatus === 'all' || migration.status === filterStatus
  )

  const runMigration = async (migrationId: string, direction: 'up' | 'down') => {
    setIsExecuting(true)
    
    // Simulate migration execution
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    
    setMigrations(prev => prev.map(migration => {
      if (migration.id === migrationId) {
        if (direction === 'up') {
          return {
            ...migration,
            status: 'applied' as const,
            appliedAt: new Date().toLocaleString(),
            executionTime: Math.floor(Math.random() * 1000) + 100
          }
        } else {
          return {
            ...migration,
            status: 'rolled_back' as const,
            rolledBackAt: new Date().toLocaleString(),
            executionTime: Math.floor(Math.random() * 500) + 50
          }
        }
      }
      return migration
    }))
    
    setIsExecuting(false)
  }

  const createMigration = async () => {
    if (!newMigrationName.trim() || !newMigrationSql.trim()) return

    const newMigration: Migration = {
      id: Date.now().toString(),
      version: `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${String(migrations.length + 1).padStart(3, '0')}`,
      name: newMigrationName.trim().toLowerCase().replace(/\s+/g, '_'),
      description: newMigrationDescription.trim(),
      status: 'pending',
      upSql: newMigrationSql,
      downSql: '-- Add rollback SQL here',
      author: 'current.user@example.com',
      checksum: Math.random().toString(36).substring(2, 15)
    }

    setMigrations(prev => [...prev, newMigration])
    setNewMigrationName('')
    setNewMigrationDescription('')
    setNewMigrationSql('')
    setShowCreateForm(false)
  }

  const generateAutoMigration = () => {
    if (schemaDiff.length === 0) return

    const migrationSql = schemaDiff.map(diff => diff.sql).join(';\n\n')
    setNewMigrationName('auto_generated_migration')
    setNewMigrationDescription('Auto-generated migration based on schema differences')
    setNewMigrationSql(migrationSql)
    setShowCreateForm(true)
  }

  const loadTemplate = (template: MigrationTemplate) => {
    setNewMigrationSql(template.template)
  }

  const getStatusColor = (status: Migration['status']) => {
    switch (status) {
      case 'applied': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      case 'rolled_back': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: Migration['status']) => {
    switch (status) {
      case 'applied': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'rolled_back': return <ArrowDown className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <PageTemplate 
      title="Database Migrations"
      description="Manage database schema changes, track migration history, and handle rollbacks"
    >
      <div className="space-y-6">
        {/* Migration Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  <CardTitle className="text-lg">Migration Management</CardTitle>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="rolled_back">Rolled Back</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAutoMigration}
                  disabled={schemaDiff.length === 0}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Generate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Migration
                </Button>
                <Button variant="default" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Run Pending
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">Migration History</TabsTrigger>
            <TabsTrigger value="diff">Schema Diff</TabsTrigger>
            <TabsTrigger value="create">Create Migration</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Migration History */}
          <TabsContent value="history" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Migration List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Migration Timeline</CardTitle>
                    <CardDescription>
                      {filteredMigrations.length} migrations found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {filteredMigrations.map((migration, index) => (
                          <div
                            key={migration.id}
                            className={cn(
                              "p-4 border rounded cursor-pointer transition-colors",
                              selectedMigration?.id === migration.id 
                                ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                            onClick={() => setSelectedMigration(migration)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(migration.status)}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{migration.version}</span>
                                    <Badge variant="outline">{migration.name}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {migration.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {migration.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        runMigration(migration.id, 'up')
                                      }}
                                      disabled={isExecuting}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                                {migration.status === 'applied' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      runMigration(migration.id, 'down')
                                    }}
                                    disabled={isExecuting}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span>By {migration.author}</span>
                              {migration.appliedAt && <span>Applied {migration.appliedAt}</span>}
                              {migration.executionTime && <span>{migration.executionTime}ms</span>}
                              {migration.batch && <span>Batch {migration.batch}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Migration Details */}
              <div>
                {selectedMigration ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5" />
                        Migration Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span>{selectedMigration.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={selectedMigration.status === 'applied' ? 'default' : 'secondary'}>
                              {selectedMigration.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Author:</span>
                            <span>{selectedMigration.author}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Checksum:</span>
                            <span className="font-mono text-xs">{selectedMigration.checksum}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Up SQL</h4>
                        <ScrollArea className="h-32">
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono">
                            {selectedMigration.upSql}
                          </pre>
                        </ScrollArea>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Down SQL</h4>
                        <ScrollArea className="h-32">
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono">
                            {selectedMigration.downSql}
                          </pre>
                        </ScrollArea>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a migration to view details
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Schema Diff */}
          <TabsContent value="diff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCommit className="h-5 w-5" />
                  Schema Differences
                </CardTitle>
                <CardDescription>
                  Detected changes between current schema and migrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schemaDiff.map((diff, index) => (
                    <div key={index} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            diff.action === 'add' ? 'default' :
                            diff.action === 'modify' ? 'secondary' : 'destructive'
                          }>
                            {diff.action.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{diff.type}</span>
                          <span className="text-muted-foreground">{diff.target}</span>
                        </div>
                      </div>
                      
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono">
                        {diff.sql}
                      </pre>
                    </div>
                  ))}
                  
                  {schemaDiff.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <GitCommit className="h-8 w-8 mx-auto mb-2" />
                      <p>No schema differences detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Migration */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Migration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Migration Name</label>
                    <Input
                      value={newMigrationName}
                      onChange={(e) => setNewMigrationName(e.target.value)}
                      placeholder="e.g., add_user_roles"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      value={newMigrationDescription}
                      onChange={(e) => setNewMigrationDescription(e.target.value)}
                      placeholder="Brief description of changes"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Up SQL</label>
                  <Textarea
                    value={newMigrationSql}
                    onChange={(e) => setNewMigrationSql(e.target.value)}
                    placeholder="Enter your migration SQL here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMigrationSql('')}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Format SQL */}}
                    >
                      Format
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={createMigration}
                    disabled={!newMigrationName.trim() || !newMigrationSql.trim()}
                  >
                    Create Migration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Migration Templates
                </CardTitle>
                <CardDescription>
                  Pre-built templates for common migration patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div key={template.id} className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono mb-3">
                        {template.template}
                      </pre>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => loadTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  )
}