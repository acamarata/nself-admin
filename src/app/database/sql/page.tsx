'use client'

import { useState, useEffect, useRef } from 'react'
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
  ChevronRight, Table, Columns, Lightbulb, AlertCircle,
  CheckCircle, XCircle, Loader2, MoreHorizontal, Edit,
  Trash2, Star, FolderOpen, Import
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QueryResult {
  columns: string[]
  rows: any[][]
  rowCount: number
  executionTime: number
  error?: string
}

interface SavedQuery {
  id: string
  name: string
  query: string
  database: string
  createdAt: string
  starred: boolean
}

interface QueryHistory {
  id: string
  query: string
  database: string
  executionTime: number
  timestamp: string
  status: 'success' | 'error'
  rowCount?: number
  error?: string
}

interface QueryTab {
  id: string
  name: string
  query: string
  result?: QueryResult
  isExecuting: boolean
  database: string
}

export default function SQLConsolePage() {
  const [activeTab, setActiveTab] = useState<string>('tab-1')
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: 'tab-1', name: 'Query 1', query: '', isExecuting: false, database: 'main' }
  ])
  const [selectedDatabase, setSelectedDatabase] = useState('main')
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [autoComplete, setAutoComplete] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mock data
  const databases = ['main', 'users', 'analytics', 'logs']
  
  useEffect(() => {
    const sampleTables = ['users', 'posts', 'comments', 'categories', 'tags', 'user_profiles']
    const sampleColumns = ['id', 'name', 'email', 'created_at', 'updated_at', 'title', 'content']
    
    // Mock query history
    setQueryHistory([
      {
        id: '1',
        query: 'SELECT * FROM users LIMIT 10',
        database: 'main',
        executionTime: 45,
        timestamp: '2024-01-15 10:30:25',
        status: 'success',
        rowCount: 10
      },
      {
        id: '2',
        query: 'SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL 1 DAY',
        database: 'main',
        executionTime: 123,
        timestamp: '2024-01-15 10:28:15',
        status: 'success',
        rowCount: 1
      },
      {
        id: '3',
        query: 'SELECT * FROM invalid_table',
        database: 'main',
        executionTime: 0,
        timestamp: '2024-01-15 10:25:45',
        status: 'error',
        error: 'Table "invalid_table" does not exist'
      }
    ])

    // Mock saved queries
    setSavedQueries([
      {
        id: '1',
        name: 'Active Users Today',
        query: 'SELECT u.id, u.name, u.email FROM users u WHERE u.last_login_at > CURRENT_DATE',
        database: 'main',
        createdAt: '2024-01-10',
        starred: true
      },
      {
        id: '2',
        name: 'Popular Posts This Week',
        query: 'SELECT p.title, COUNT(l.id) as likes FROM posts p LEFT JOIN likes l ON p.id = l.post_id WHERE p.created_at > NOW() - INTERVAL 7 DAY GROUP BY p.id ORDER BY likes DESC LIMIT 20',
        database: 'main',
        createdAt: '2024-01-12',
        starred: false
      }
    ])

    // Setup autocomplete
    setAutoComplete([...sampleTables, ...sampleColumns, 'SELECT', 'FROM', 'WHERE', 'JOIN', 'INSERT', 'UPDATE', 'DELETE'])
  }, [])

  const executeQuery = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || !tab.query.trim()) return

    setTabs(prev => prev.map(t => 
      t.id === tabId ? { ...t, isExecuting: true } : t
    ))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const mockResult: QueryResult = {
      columns: ['id', 'name', 'email', 'created_at'],
      rows: [
        [1, 'John Doe', 'john@example.com', '2024-01-15 09:30:00'],
        [2, 'Jane Smith', 'jane@example.com', '2024-01-15 09:45:00'],
        [3, 'Bob Wilson', 'bob@example.com', '2024-01-15 10:00:00'],
        [4, 'Alice Johnson', 'alice@example.com', '2024-01-15 10:15:00'],
        [5, 'Charlie Brown', 'charlie@example.com', '2024-01-15 10:30:00']
      ],
      rowCount: 5,
      executionTime: 156
    }

    // Add to history
    const historyEntry: QueryHistory = {
      id: Date.now().toString(),
      query: tab.query,
      database: tab.database,
      executionTime: mockResult.executionTime,
      timestamp: new Date().toLocaleString(),
      status: 'success',
      rowCount: mockResult.rowCount
    }
    setQueryHistory(prev => [historyEntry, ...prev])

    setTabs(prev => prev.map(t => 
      t.id === tabId ? { ...t, isExecuting: false, result: mockResult } : t
    ))
  }

  const addNewTab = () => {
    const newTabId = `tab-${Date.now()}`
    const newTab: QueryTab = {
      id: newTabId,
      name: `Query ${tabs.length + 1}`,
      query: '',
      isExecuting: false,
      database: selectedDatabase
    }
    setTabs(prev => [...prev, newTab])
    setActiveTab(newTabId)
  }

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return
    
    const tabIndex = tabs.findIndex(t => t.id === tabId)
    setTabs(prev => prev.filter(t => t.id !== tabId))
    
    if (activeTab === tabId) {
      const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0
      setActiveTab(tabs[newActiveIndex]?.id || tabs[0]?.id)
    }
  }

  const updateTabQuery = (tabId: string, query: string) => {
    setTabs(prev => prev.map(t => 
      t.id === tabId ? { ...t, query } : t
    ))
  }

  const loadQueryFromHistory = (historyItem: QueryHistory) => {
    const activeTabData = tabs.find(t => t.id === activeTab)
    if (activeTabData) {
      updateTabQuery(activeTab, historyItem.query)
    }
    setShowHistory(false)
  }

  const loadSavedQuery = (savedQuery: SavedQuery) => {
    const activeTabData = tabs.find(t => t.id === activeTab)
    if (activeTabData) {
      updateTabQuery(activeTab, savedQuery.query)
    }
    setShowSaved(false)
  }

  const saveCurrentQuery = () => {
    const activeTabData = tabs.find(t => t.id === activeTab)
    if (activeTabData && activeTabData.query.trim()) {
      const newSavedQuery: SavedQuery = {
        id: Date.now().toString(),
        name: `Query ${savedQueries.length + 1}`,
        query: activeTabData.query,
        database: activeTabData.database,
        createdAt: new Date().toISOString().split('T')[0],
        starred: false
      }
      setSavedQueries(prev => [newSavedQuery, ...prev])
    }
  }

  const exportResults = (format: 'csv' | 'json') => {
    const activeTabData = tabs.find(t => t.id === activeTab)
    if (!activeTabData?.result) return

    // Mock export functionality
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <PageTemplate 
     
      description="Execute SQL queries with multi-tab editor, query history, and results export"
    >
      <div className="space-y-6">
        {/* Connection Status & Database Selector */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <CardTitle className="text-lg">Database Connection</CardTitle>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map(db => (
                      <SelectItem key={db} value={db}>{db}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                 
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button
                  variant="outline"
                 
                  onClick={() => setShowSaved(!showSaved)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Saved
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Query Editor Tabs */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md">
                  {tabs.map(tab => (
                    <div
                      key={tab.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm border-r last:border-r-0 cursor-pointer",
                        activeTab === tab.id 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span>{tab.name}</span>
                      {tab.isExecuting && <Loader2 className="h-3 w-3 animate-spin" />}
                      {tabs.length > 1 && (
                        <X 
                          className="h-3 w-3 hover:text-red-500" 
                          onClick={(e) => {
                            e.stopPropagation()
                            closeTab(tab.id)
                          }}
                        />
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    
                    className="px-2"
                    onClick={addNewTab}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                 
                  onClick={saveCurrentQuery}
                  disabled={!activeTabData?.query.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Query
                </Button>
                <Button
                  onClick={() => executeQuery(activeTab)}
                  disabled={!activeTabData?.query.trim() || activeTabData?.isExecuting}
                 
                >
                  {activeTabData?.isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            {/* SQL Editor */}
            <div className="space-y-4">
              <Textarea
                ref={textareaRef}
                value={activeTabData?.query || ''}
                onChange={(e) => updateTabQuery(activeTab, e.target.value)}
                placeholder="Enter your SQL query here..."
                className="min-h-[200px] font-mono text-sm"
              />
              
              {/* Query Info */}
              {activeTabData?.query && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Database: {activeTabData.database}</span>
                  <span>Characters: {activeTabData.query.length}</span>
                  <span>Lines: {activeTabData.query.split('\n').length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Query Results */}
        {activeTabData?.result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">Results</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {activeTabData.result.executionTime}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <Table className="h-4 w-4" />
                      {activeTabData.result.rowCount} rows
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                   
                    onClick={() => exportResults('csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                   
                    onClick={() => exportResults('json')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-96">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        {activeTabData.result.columns.map((column, index) => (
                          <th
                            key={index}
                            className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTabData.result.rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border border-gray-200 dark:border-gray-700 px-4 py-2"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Query History Sidebar */}
        {showHistory && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Query History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {queryHistory.map(item => (
                    <div
                      key={item.id}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => loadQueryFromHistory(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant="outline">{item.database}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp}
                        </div>
                      </div>
                      <div className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                        {item.query}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{item.executionTime}ms</span>
                        {item.rowCount !== undefined && <span>{item.rowCount} rows</span>}
                        {item.error && <span className="text-red-500">{item.error}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Saved Queries Sidebar */}
        {showSaved && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Saved Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {savedQueries.map(item => (
                    <div
                      key={item.id}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => loadSavedQuery(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">{item.database}</Badge>
                      </div>
                      <div className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded truncate">
                        {item.query}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Created: {item.createdAt}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Quick Actions & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Schema Browser</div>
                  <div className="text-xs text-muted-foreground">Browse tables</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Query Templates</div>
                  <div className="text-xs text-muted-foreground">Common queries</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Format Query</div>
                  <div className="text-xs text-muted-foreground">Auto-format SQL</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Explain Plan</div>
                  <div className="text-xs text-muted-foreground">Query optimization</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  )
}