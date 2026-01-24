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
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  CheckCircle,
  Code,
  Copy,
  Database,
  Download,
  FileCode,
  Loader2,
  RefreshCw,
  Settings,
  Terminal,
} from 'lucide-react'
import { useState } from 'react'

type Language = 'typescript' | 'go' | 'python'

interface GenerationOptions {
  includeComments: boolean
  includeNullable: boolean
  useOptional: boolean
  generateValidation: boolean
  exportTypes: boolean
}

const LANGUAGE_CONFIGS: Record<
  Language,
  { name: string; extension: string; icon: string; color: string }
> = {
  typescript: {
    name: 'TypeScript',
    extension: '.ts',
    icon: 'TS',
    color: 'bg-blue-500/10 text-blue-500',
  },
  go: {
    name: 'Go',
    extension: '.go',
    icon: 'Go',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
  python: {
    name: 'Python',
    extension: '.py',
    icon: 'Py',
    color: 'bg-yellow-500/10 text-yellow-500',
  },
}

const SAMPLE_TYPESCRIPT = `// Generated from database schema
// Generated at: ${new Date().toISOString()}

export interface User {
  /** Unique identifier */
  id: string;
  /** User's email address */
  email: string;
  /** Hashed password */
  password_hash: string;
  /** Display name */
  name: string | null;
  /** Avatar image URL */
  avatar_url: string | null;
  /** User role (admin, user, etc.) */
  role: string;
  /** Account creation timestamp */
  created_at: Date;
  /** Last update timestamp */
  updated_at: Date;
}

export interface Post {
  /** Unique identifier */
  id: string;
  /** Post title */
  title: string;
  /** Post content (markdown) */
  content: string | null;
  /** Author user ID */
  user_id: string;
  /** Publication status */
  status: 'draft' | 'published' | 'archived';
  /** Publication timestamp */
  published_at: Date | null;
  /** Creation timestamp */
  created_at: Date;
  /** Last update timestamp */
  updated_at: Date;
}

export interface Comment {
  /** Unique identifier */
  id: string;
  /** Comment content */
  content: string;
  /** Parent post ID */
  post_id: string;
  /** Author user ID */
  user_id: string;
  /** Creation timestamp */
  created_at: Date;
}

// Type helpers
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<UserInsert>;
export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type PostUpdate = Partial<PostInsert>;
`

const SAMPLE_GO = `// Generated from database schema
// Generated at: ${new Date().toISOString()}

package models

import (
\t"time"
)

// User represents the users table
type User struct {
\tID           string    \`json:"id" db:"id"\`
\tEmail        string    \`json:"email" db:"email"\`
\tPasswordHash string    \`json:"-" db:"password_hash"\`
\tName         *string   \`json:"name,omitempty" db:"name"\`
\tAvatarURL    *string   \`json:"avatar_url,omitempty" db:"avatar_url"\`
\tRole         string    \`json:"role" db:"role"\`
\tCreatedAt    time.Time \`json:"created_at" db:"created_at"\`
\tUpdatedAt    time.Time \`json:"updated_at" db:"updated_at"\`
}

// Post represents the posts table
type Post struct {
\tID          string     \`json:"id" db:"id"\`
\tTitle       string     \`json:"title" db:"title"\`
\tContent     *string    \`json:"content,omitempty" db:"content"\`
\tUserID      string     \`json:"user_id" db:"user_id"\`
\tStatus      string     \`json:"status" db:"status"\`
\tPublishedAt *time.Time \`json:"published_at,omitempty" db:"published_at"\`
\tCreatedAt   time.Time  \`json:"created_at" db:"created_at"\`
\tUpdatedAt   time.Time  \`json:"updated_at" db:"updated_at"\`
}

// Comment represents the comments table
type Comment struct {
\tID        string    \`json:"id" db:"id"\`
\tContent   string    \`json:"content" db:"content"\`
\tPostID    string    \`json:"post_id" db:"post_id"\`
\tUserID    string    \`json:"user_id" db:"user_id"\`
\tCreatedAt time.Time \`json:"created_at" db:"created_at"\`
}
`

const SAMPLE_PYTHON = `# Generated from database schema
# Generated at: ${new Date().toISOString()}

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class PostStatus(Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


@dataclass
class User:
    """User model representing the users table"""
    id: str
    email: str
    password_hash: str
    name: Optional[str]
    avatar_url: Optional[str]
    role: str
    created_at: datetime
    updated_at: datetime


@dataclass
class Post:
    """Post model representing the posts table"""
    id: str
    title: str
    content: Optional[str]
    user_id: str
    status: PostStatus
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


@dataclass
class Comment:
    """Comment model representing the comments table"""
    id: str
    content: str
    post_id: str
    user_id: str
    created_at: datetime
`

export default function DatabaseTypesPage() {
  const [language, setLanguage] = useState<Language>('typescript')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [lastOutput, setLastOutput] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [options, setOptions] = useState<GenerationOptions>({
    includeComments: true,
    includeNullable: true,
    useOptional: true,
    generateValidation: false,
    exportTypes: true,
  })

  const generateTypes = async () => {
    setIsGenerating(true)
    setLastOutput('')

    try {
      // Simulate CLI call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let code = ''
      switch (language) {
        case 'typescript':
          code = SAMPLE_TYPESCRIPT
          break
        case 'go':
          code = SAMPLE_GO
          break
        case 'python':
          code = SAMPLE_PYTHON
          break
      }

      setGeneratedCode(code)
      setLastOutput(
        `Successfully generated ${language} types from schema\n\nTables processed: 3\nTypes generated: 3\nHelper types: ${language === 'typescript' ? '4' : '0'}`,
      )
    } catch (error) {
      setLastOutput(
        error instanceof Error ? error.message : 'Generation failed',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadCode = () => {
    if (!generatedCode) return

    const config = LANGUAGE_CONFIGS[language]
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `types${config.extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageTemplate
      title="Type Generation"
      description="Generate type definitions from your database schema"
    >
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself db types
            </code>{' '}
            to generate type definitions from your database schema. Supports
            TypeScript, Go, and Python.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <CardTitle>Generation Options</CardTitle>
              </div>
              <CardDescription>
                Configure type generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selector */}
              <div className="space-y-2">
                <Label>Target Language</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(LANGUAGE_CONFIGS) as Language[]).map((lang) => {
                    const config = LANGUAGE_CONFIGS[lang]
                    return (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang)
                          setGeneratedCode(null)
                        }}
                        className={`flex items-center justify-center gap-2 rounded-lg border p-4 transition-colors ${
                          language === lang
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        <Badge className={config.color}>{config.icon}</Badge>
                        <span className="font-medium">{config.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Include Comments</p>
                    <p className="text-xs text-zinc-500">
                      Add JSDoc/docstring comments from column descriptions
                    </p>
                  </div>
                  <Switch
                    checked={options.includeComments}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeComments: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Handle Nullable</p>
                    <p className="text-xs text-zinc-500">
                      Mark nullable columns as optional types
                    </p>
                  </div>
                  <Switch
                    checked={options.includeNullable}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, includeNullable: checked })
                    }
                  />
                </div>

                {language === 'typescript' && (
                  <>
                    <div className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                      <div>
                        <p className="text-sm font-medium">
                          Use Optional Properties
                        </p>
                        <p className="text-xs text-zinc-500">
                          Use ? syntax instead of | null for optional fields
                        </p>
                      </div>
                      <Switch
                        checked={options.useOptional}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, useOptional: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                      <div>
                        <p className="text-sm font-medium">Export Types</p>
                        <p className="text-xs text-zinc-500">
                          Add export keyword to all type definitions
                        </p>
                      </div>
                      <Switch
                        checked={options.exportTypes}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, exportTypes: checked })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Generate Validation</p>
                    <p className="text-xs text-zinc-500">
                      Include Zod schemas (TS) or validation methods
                    </p>
                  </div>
                  <Switch
                    checked={options.generateValidation}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, generateValidation: checked })
                    }
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateTypes}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    Generate Types
                  </>
                )}
              </Button>

              {/* Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself db types --lang={language}
                  {options.includeComments && ' --comments'}
                  {options.generateValidation && ' --validation'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CLI Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                CLI Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 rounded-lg bg-zinc-950 p-4">
                {lastOutput ? (
                  <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
                    {lastOutput}
                  </pre>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Generate types to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Generated Code */}
        {generatedCode && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  <CardTitle>Generated Code</CardTitle>
                  <Badge className={LANGUAGE_CONFIGS[language].color}>
                    {LANGUAGE_CONFIGS[language].name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCode}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGeneratedCode(null)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 rounded-lg bg-zinc-950 p-4">
                <pre className="font-mono text-sm text-zinc-300">
                  <code>{generatedCode}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTemplate>
  )
}
