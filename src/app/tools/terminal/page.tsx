'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  Terminal as TerminalIcon, Play, Square, RotateCw, 
  Settings, Download, Upload, Copy, Trash2, Plus,
  ChevronRight, Folder, History, Clock, User,
  Server, Command, FileText, Save, Share, Eye,
  EyeOff, Maximize2, Minimize2, X, MoreHorizontal,
  Activity, Cpu, HardDrive, Network, AlertCircle,
  CheckCircle, Info, RefreshCw, Zap, Code
} from 'lucide-react'

interface TerminalSession {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error'
  created: string
  lastActivity: string
  command: string
  pid?: number
  workingDir: string
  environment: string
  user: string
}

interface TerminalOutput {
  id: string
  sessionId: string
  type: 'command' | 'output' | 'error' | 'system'
  content: string
  timestamp: string
  exitCode?: number
}

interface SystemInfo {
  hostname: string
  platform: string
  arch: string
  release: string
  uptime: number
  loadAverage: number[]
  memory: {
    total: number
    free: number
    used: number
  }
  cpu: {
    model: string
    cores: number
    usage: number
  }
}

const mockSessions: TerminalSession[] = [
  {
    id: '1',
    name: 'Main Terminal',
    status: 'running',
    created: '2024-01-15T10:00:00Z',
    lastActivity: '2024-01-15T10:30:00Z',
    command: 'docker ps',
    pid: 12345,
    workingDir: '/var/lib/nself',
    environment: 'production',
    user: 'nself'
  },
  {
    id: '2',
    name: 'Database Console',
    status: 'running',
    created: '2024-01-15T09:45:00Z',
    lastActivity: '2024-01-15T10:25:00Z',
    command: 'psql -h localhost -U postgres',
    pid: 12378,
    workingDir: '/home/nself',
    environment: 'production',
    user: 'postgres'
  },
  {
    id: '3',
    name: 'Build Process',
    status: 'stopped',
    created: '2024-01-15T09:30:00Z',
    lastActivity: '2024-01-15T09:35:00Z',
    command: 'npm run build',
    workingDir: '/app/frontend',
    environment: 'development',
    user: 'node'
  }
]

const mockOutputs: TerminalOutput[] = [
  {
    id: '1',
    sessionId: '1',
    type: 'system',
    content: 'Terminal session started',
    timestamp: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    sessionId: '1',
    type: 'command',
    content: '$ docker ps',
    timestamp: '2024-01-15T10:00:05Z'
  },
  {
    id: '3',
    sessionId: '1',
    type: 'output',
    content: `CONTAINER ID   IMAGE                    COMMAND                  CREATED        STATUS        PORTS                    NAMES
b8f2c1d5e4a3   nself/postgres:latest    "docker-entrypoint.s…"  2 hours ago    Up 2 hours    0.0.0.0:5432->5432/tcp   nself_postgres
a7e9d3c2b1f0   nself/hasura:latest      "graphql-engine serve"   2 hours ago    Up 2 hours    0.0.0.0:8080->8080/tcp   nself_hasura
c9f1e5a8d2b6   nself/nginx:latest       "/docker-entrypoint.…"  2 hours ago    Up 2 hours    0.0.0.0:80->80/tcp       nself_nginx`,
    timestamp: '2024-01-15T10:00:06Z'
  },
  {
    id: '4',
    sessionId: '1',
    type: 'command',
    content: '$ ls -la',
    timestamp: '2024-01-15T10:01:00Z'
  },
  {
    id: '5',
    sessionId: '1',
    type: 'output',
    content: `total 48
drwxr-xr-x  12 nself  nself   384 Jan 15 10:00 .
drwxr-xr-x   6 root   root    192 Jan 15 09:00 ..
-rw-r--r--   1 nself  nself  1024 Jan 15 09:30 docker-compose.yml
drwxr-xr-x   8 nself  nself   256 Jan 15 09:45 data
drwxr-xr-x   4 nself  nself   128 Jan 15 09:30 logs
-rw-r--r--   1 nself  nself   512 Jan 15 09:30 README.md`,
    timestamp: '2024-01-15T10:01:01Z'
  }
]

const mockSystemInfo: SystemInfo = {
  hostname: 'nself-server-01',
  platform: 'linux',
  arch: 'x64',
  release: 'Ubuntu 22.04.3 LTS',
  uptime: 172800, // 2 days
  loadAverage: [0.85, 0.92, 1.15],
  memory: {
    total: 16 * 1024 * 1024 * 1024, // 16GB
    free: 8 * 1024 * 1024 * 1024,   // 8GB
    used: 8 * 1024 * 1024 * 1024    // 8GB
  },
  cpu: {
    model: 'Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz',
    cores: 8,
    usage: 35.6
  }
}

function formatSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${days}d ${hours}h ${mins}m`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function SessionTab({ 
  session, 
  isActive, 
  onSelect, 
  onClose, 
  onAction 
}: { 
  session: TerminalSession
  isActive: boolean
  onSelect: () => void
  onClose: () => void
  onAction: (action: string, sessionId: string) => void
}) {
  const statusConfig = {
    running: { color: 'text-green-600 dark:text-green-400', icon: Play },
    stopped: { color: 'text-gray-600 dark:text-gray-400', icon: Square },
    error: { color: 'text-red-600 dark:text-red-400', icon: AlertCircle }
  }

  const config = statusConfig[session.status]
  const StatusIcon = config.icon

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer border-b-2 ${
        isActive 
          ? 'bg-white dark:bg-zinc-800 border-blue-500' 
          : 'bg-zinc-100 dark:bg-zinc-700 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-600'
      }`}
      onClick={onSelect}
    >
      <StatusIcon className={`w-3 h-3 ${config.color}`} />
      <span className="text-sm font-medium">{session.name}</span>
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAction(session.status === 'running' ? 'stop' : 'start', session.id)
          }}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600"
        >
          {session.status === 'running' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function TerminalOutput({ outputs, sessionId }: { outputs: TerminalOutput[]; sessionId: string }) {
  const sessionOutputs = outputs.filter(output => output.sessionId === sessionId)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [sessionOutputs])

  const getOutputStyle = (type: string) => {
    switch (type) {
      case 'command':
        return 'text-green-400 font-medium'
      case 'error':
        return 'text-red-400'
      case 'system':
        return 'text-yellow-400 italic'
      default:
        return 'text-zinc-100'
    }
  }

  return (
    <div 
      ref={terminalRef}
      className="flex-1 bg-black p-4 font-mono text-sm overflow-y-auto"
      style={{ minHeight: '400px', maxHeight: '600px' }}
    >
      {sessionOutputs.map(output => (
        <div key={output.id} className={`mb-1 ${getOutputStyle(output.type)}`}>
          <span className="text-zinc-500 text-xs mr-2">
            {new Date(output.timestamp).toLocaleTimeString()}
          </span>
          <span className="whitespace-pre-wrap">{output.content}</span>
          {output.exitCode !== undefined && (
            <span className={`ml-2 text-xs ${output.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>
              [exit: {output.exitCode}]
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function CommandInput({ 
  onExecute, 
  isRunning,
  workingDir 
}: { 
  onExecute: (command: string) => void
  isRunning: boolean
  workingDir: string
}) {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isRunning) {
      onExecute(command)
      setHistory(prev => [...prev, command])
      setCommand('')
      setHistoryIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(history[history.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(history[history.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-700 bg-zinc-900 p-3">
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-mono text-sm">
          nself@server:{workingDir}$
        </span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRunning ? "Command running..." : "Enter command..."}
          disabled={isRunning}
          className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-zinc-500"
        />
        {isRunning && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Activity className="w-3 h-3 animate-pulse" />
            <span className="text-xs">Running</span>
          </div>
        )}
      </div>
    </form>
  )
}

function SessionInfo({ session }: { session: TerminalSession }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Session Info</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
          <span className={`font-medium ${
            session.status === 'running' ? 'text-green-600 dark:text-green-400' :
            session.status === 'error' ? 'text-red-600 dark:text-red-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {session.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">PID:</span>
          <span className="font-mono">{session.pid || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">User:</span>
          <span className="font-mono">{session.user}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Working Dir:</span>
          <span className="font-mono text-xs">{session.workingDir}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Environment:</span>
          <span className="font-medium">{session.environment}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Created:</span>
          <span className="text-xs">{formatDate(session.created)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Last Activity:</span>
          <span className="text-xs">{formatDate(session.lastActivity)}</span>
        </div>
      </div>
    </div>
  )
}

function SystemStats({ systemInfo }: { systemInfo: SystemInfo }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">System Information</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-500 dark:text-zinc-400">CPU Usage</span>
            <span className="font-medium">{systemInfo.cpu.usage}%</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${systemInfo.cpu.usage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-500 dark:text-zinc-400">Memory Usage</span>
            <span className="font-medium">
              {formatSize(systemInfo.memory.used)} / {formatSize(systemInfo.memory.total)}
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Hostname:</span>
            <span className="font-mono">{systemInfo.hostname}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Platform:</span>
            <span>{systemInfo.platform} {systemInfo.arch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Release:</span>
            <span>{systemInfo.release}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Uptime:</span>
            <span>{formatUptime(systemInfo.uptime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Load Avg:</span>
            <span className="font-mono text-xs">
              {systemInfo.loadAverage.map(load => load.toFixed(2)).join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TerminalPage() {
  const [sessions, setSessions] = useState<TerminalSession[]>(mockSessions)
  const [outputs, setOutputs] = useState<TerminalOutput[]>(mockOutputs)
  const [activeSessionId, setActiveSessionId] = useState<string>('1')
  const [isRunning, setIsRunning] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const handleSessionAction = (action: string, sessionId: string) => {
    console.log(`Session action: ${action} for ${sessionId}`)
    
    if (action === 'start' || action === 'stop') {
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, status: action === 'start' ? 'running' : 'stopped' }
          : session
      ))
    }
  }

  const handleCloseSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId && sessions.length > 1) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId)
      setActiveSessionId(remainingSessions[0].id)
    }
  }

  const handleCreateSession = () => {
    const newSession: TerminalSession = {
      id: Date.now().toString(),
      name: `Terminal ${sessions.length + 1}`,
      status: 'running',
      created: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      command: '',
      pid: Math.floor(Math.random() * 90000) + 10000,
      workingDir: '/var/lib/nself',
      environment: 'production',
      user: 'nself'
    }
    
    setSessions(prev => [...prev, newSession])
    setActiveSessionId(newSession.id)
  }

  const handleExecuteCommand = (command: string) => {
    if (!activeSession) return

    setIsRunning(true)

    // Add command to outputs
    const commandOutput: TerminalOutput = {
      id: Date.now().toString(),
      sessionId: activeSessionId,
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date().toISOString()
    }

    setOutputs(prev => [...prev, commandOutput])

    // Simulate command execution
    setTimeout(() => {
      const responseOutput: TerminalOutput = {
        id: (Date.now() + 1).toString(),
        sessionId: activeSessionId,
        type: command.startsWith('ls') ? 'output' : 'output',
        content: getSimulatedResponse(command),
        timestamp: new Date().toISOString(),
        exitCode: 0
      }

      setOutputs(prev => [...prev, responseOutput])
      setIsRunning(false)

      // Update session last activity
      setSessions(prev => prev.map(session =>
        session.id === activeSessionId
          ? { ...session, lastActivity: new Date().toISOString(), command }
          : session
      ))
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const getSimulatedResponse = (command: string): string => {
    const cmd = command.toLowerCase().trim()
    
    if (cmd.startsWith('ls')) {
      return 'docker-compose.yml\ndata/\nlogs/\nREADME.md\nscripts/'
    } else if (cmd.startsWith('pwd')) {
      return '/var/lib/nself'
    } else if (cmd.startsWith('whoami')) {
      return 'nself'
    } else if (cmd.startsWith('date')) {
      return new Date().toString()
    } else if (cmd.startsWith('ps')) {
      return `  PID TTY          TIME CMD
12345 pts/0    00:00:01 bash
12378 pts/1    00:00:00 psql
12456 pts/0    00:00:00 ps`
    } else if (cmd.startsWith('docker')) {
      return 'CONTAINER ID   IMAGE                    STATUS\nb8f2c1d5e4a3   nself/postgres:latest    Up 2 hours\na7e9d3c2b1f0   nself/hasura:latest      Up 2 hours'
    } else if (cmd.startsWith('help')) {
      return `Available commands:
ls, pwd, whoami, date, ps, docker, help, clear
Use 'man <command>' for more information.`
    } else if (cmd === 'clear') {
      // Clear terminal
      setOutputs(prev => prev.filter(output => output.sessionId !== activeSessionId))
      return ''
    } else {
      return `Command '${command}' executed successfully.`
    }
  }

  return (
    <>
      <HeroPattern />
      <div className="max-w-[95vw] mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Web Terminal</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Browser-based terminal with command execution and session management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateSession}
                variant="filled"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Session
              </Button>
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="outline"
                className="flex items-center gap-2"
              >
                {showSidebar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSidebar ? 'Hide' : 'Show'} Sidebar
              </Button>
              <Button
                onClick={() => console.log('Terminal settings')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Session Tabs */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {sessions.map(session => (
              <SessionTab
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => setActiveSessionId(session.id)}
                onClose={() => handleCloseSession(session.id)}
                onAction={handleSessionAction}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Terminal */}
          <div className={`${showSidebar ? 'flex-1' : 'w-full'}`}>
            <div className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden shadow-lg">
              {/* Terminal Header */}
              <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-white text-sm font-medium">
                    {activeSession?.name || 'Terminal'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-xs">
                    {activeSession?.user}@{mockSystemInfo.hostname}
                  </span>
                  <button className="text-zinc-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Terminal Content */}
              {activeSession ? (
                <>
                  <TerminalOutput outputs={outputs} sessionId={activeSessionId} />
                  <CommandInput
                    onExecute={handleExecuteCommand}
                    isRunning={isRunning}
                    workingDir={activeSession.workingDir}
                  />
                </>
              ) : (
                <div className="p-8 text-center text-zinc-400">
                  <TerminalIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active terminal session</p>
                  <Button onClick={handleCreateSession} className="mt-4">
                    Create New Session
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 space-y-4">
              {activeSession && <SessionInfo session={activeSession} />}
              <SystemStats systemInfo={mockSystemInfo} />
              
              {/* Quick Commands */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Quick Commands</h3>
                <div className="space-y-2">
                  {[
                    { label: 'List Files', command: 'ls -la' },
                    { label: 'System Info', command: 'uname -a' },
                    { label: 'Docker Status', command: 'docker ps' },
                    { label: 'Process List', command: 'ps aux' },
                    { label: 'Disk Usage', command: 'df -h' },
                    { label: 'Memory Info', command: 'free -h' }
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleExecuteCommand(item.command)}
                      disabled={isRunning}
                      className="w-full text-left px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 disabled:opacity-50"
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-zinc-500 font-mono">{item.command}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session History */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Session History</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={`text-xs p-2 rounded cursor-pointer ${
                        session.id === activeSessionId
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600'
                      }`}
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      <div className="font-medium">{session.name}</div>
                      <div className="text-zinc-500">{session.command || 'No command'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}