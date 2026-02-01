'use client'

import Editor from '@monaco-editor/react'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'

interface SQLEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  onExecute?: () => void
  readOnly?: boolean
  height?: string
}

export function SQLEditor({
  value,
  onChange,
  onExecute,
  readOnly = false,
  height = '400px',
}: SQLEditorProps) {
  const { theme } = useTheme()

  const handleEditorMount = (editor: any, monaco: any) => {
    // Add keyboard shortcut for execute (Cmd+Enter or Ctrl+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onExecute) {
        onExecute()
      }
    })
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Editor
        height={height}
        defaultLanguage="sql"
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: true },
          lineNumbers: 'on',
          readOnly,
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
        }}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        }
      />
    </div>
  )
}
