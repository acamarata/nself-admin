'use client'

import { PageTemplate } from '@/components/PageTemplate'
import { FormSkeleton } from '@/components/skeletons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2,
  Settings,
  Terminal,
  Upload,
  XCircle,
} from 'lucide-react'
import { Suspense, useCallback, useRef, useState } from 'react'

const ENVIRONMENTS = [
  { value: 'local', label: 'Local' },
  { value: 'dev', label: 'Dev' },
  { value: 'stage', label: 'Stage' },
  { value: 'prod', label: 'Prod' },
]

const FORMATS = [
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
]

function ConfigImportContent() {
  const [environment, setEnvironment] = useState('local')
  const [format, setFormat] = useState('json')
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [lastOutput, setLastOutput] = useState('')
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setFileName(file.name)

      // Auto-detect format from extension
      if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        setFormat('yaml')
      } else if (file.name.endsWith('.json')) {
        setFormat('json')
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text === 'string') {
          setFileContent(text)
        }
      }
      reader.readAsText(file)
    },
    [],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file) return

      // Create a synthetic event-like structure for reuse
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files
        handleFileUpload({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
    },
    [],
  )

  const runPreview = async () => {
    if (!fileContent) {
      setLastOutput('Error: No configuration content to preview.')
      setImportSuccess(false)
      return
    }

    setIsPreviewing(true)
    setLastOutput('')
    setImportSuccess(null)

    try {
      const response = await fetch('/api/config/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment,
          content: fileContent,
          format,
          preview: true,
        }),
      })

      const data = await response.json()
      const output =
        data.data?.output || data.data?.stderr || data.error || data.details
      setLastOutput(output || JSON.stringify(data, null, 2))
      setImportSuccess(data.success)
    } catch (error) {
      setLastOutput(
        error instanceof Error ? error.message : 'Preview request failed',
      )
      setImportSuccess(false)
    } finally {
      setIsPreviewing(false)
    }
  }

  const runImport = async () => {
    if (!fileContent) {
      setLastOutput('Error: No configuration content to import.')
      setImportSuccess(false)
      return
    }

    setIsImporting(true)
    setLastOutput('')
    setImportSuccess(null)

    try {
      const response = await fetch('/api/config/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment,
          content: fileContent,
          format,
          preview: false,
        }),
      })

      const data = await response.json()
      const output =
        data.data?.output || data.data?.stderr || data.error || data.details
      setLastOutput(output || JSON.stringify(data, null, 2))
      setImportSuccess(data.success)
    } catch (error) {
      setLastOutput(
        error instanceof Error ? error.message : 'Import request failed',
      )
      setImportSuccess(false)
    } finally {
      setIsImporting(false)
    }
  }

  const isActionDisabled = isImporting || isPreviewing || !fileContent

  return (
    <PageTemplate
      title="Config Import"
      description="Import configuration from a file into an environment using nself CLI"
    >
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertTitle>nself CLI Integration</AlertTitle>
          <AlertDescription>
            This page executes{' '}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
              nself config import
            </code>{' '}
            to import configuration into a specific environment. Use the preview
            button to see changes before applying.
          </AlertDescription>
        </Alert>

        {/* Warning for prod */}
        {environment === 'prod' && (
          <Alert variant="destructive" className="border-red-600 bg-red-950/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Production Environment</AlertTitle>
            <AlertDescription>
              You are importing configuration into the{' '}
              <strong>production</strong> environment. Please preview changes
              before applying.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Import Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <CardTitle>Import Configuration</CardTitle>
              </div>
              <CardDescription>
                Upload a configuration file and select the target environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              >
                <Upload className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
                {fileName ? (
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {fileName}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {fileContent.length} characters loaded
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Drop a file here or click to upload
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Supports JSON and YAML configuration files
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Environment and Format Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Target Environment
                  </label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTS.map((env) => (
                        <SelectItem key={env.value} value={env.value}>
                          {env.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Format
                  </label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((fmt) => (
                        <SelectItem key={fmt.value} value={fmt.value}>
                          {fmt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={runPreview}
                  disabled={isActionDisabled}
                  className="flex-1"
                  size="lg"
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Previewing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Changes
                    </>
                  )}
                </Button>

                <Button
                  onClick={runImport}
                  disabled={isActionDisabled}
                  className="flex-1"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Apply Import
                    </>
                  )}
                </Button>
              </div>

              {/* Command Preview */}
              <div className="rounded-lg bg-zinc-900 p-4 font-mono text-sm text-green-400">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Terminal className="h-4 w-4" />
                  <span>Command:</span>
                </div>
                <div className="mt-2">
                  $ nself config import --env={environment} --format={format}
                  {fileName ? ` --file=${fileName}` : ' --file=<config-file>'}
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
              <ScrollArea className="h-96 rounded-lg bg-zinc-950 p-4">
                {lastOutput ? (
                  <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
                    {lastOutput}
                  </pre>
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Upload a file and preview or import to see output here
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* File Content Preview */}
        {fileContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                File Content Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 rounded-lg bg-zinc-950 p-4">
                <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-300">
                  {fileContent}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Success/Error Indicator */}
        {importSuccess !== null && lastOutput && (
          <div
            className={`fixed right-4 bottom-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white shadow-lg ${
              importSuccess ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {importSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Operation completed successfully
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Operation failed
              </>
            )}
          </div>
        )}
      </div>
    </PageTemplate>
  )
}

export default function ConfigImportPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <ConfigImportContent />
    </Suspense>
  )
}
