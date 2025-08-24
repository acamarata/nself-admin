'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/Button'
import { HeroPattern } from '@/components/HeroPattern'
import { 
  Database, Table, FileText, Search, Plus, Edit3, Trash2,
  Download, Upload, RefreshCw, Settings, Eye, Code,
  Link, Unlink, ZoomIn, ZoomOut, Move, Save, Copy,
  MoreVertical, AlertCircle, CheckCircle, Info, 
  Key, Hash, Type, Calendar, MapPin, ArrowRight,
  Filter, Layers, GitBranch, Box, ChevronDown,
  ChevronRight, ExternalLink, PlayCircle, History
} from 'lucide-react'

interface Column {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: {
    table: string
    column: string
  }
  defaultValue?: string
  description?: string
}

interface Table {
  id: string
  name: string
  schema: string
  columns: Column[]
  relationships: Relationship[]
  position: { x: number; y: number }
  selected: boolean
  rowCount?: number
  description?: string
}

interface Relationship {
  id: string
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
}

const mockTables: Table[] = [
  {
    id: '1',
    name: 'users',
    schema: 'public',
    position: { x: 100, y: 100 },
    selected: false,
    rowCount: 1247,
    description: 'User accounts and profiles',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'email', type: 'varchar(255)', nullable: false, primaryKey: false },
      { name: 'password_hash', type: 'varchar(255)', nullable: false, primaryKey: false },
      { name: 'first_name', type: 'varchar(100)', nullable: true, primaryKey: false },
      { name: 'last_name', type: 'varchar(100)', nullable: true, primaryKey: false },
      { name: 'role', type: 'varchar(50)', nullable: false, primaryKey: false, defaultValue: 'user' },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    relationships: []
  },
  {
    id: '2',
    name: 'projects',
    schema: 'public',
    position: { x: 450, y: 100 },
    selected: false,
    rowCount: 89,
    description: 'User projects and workspaces',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'name', type: 'varchar(200)', nullable: false, primaryKey: false },
      { name: 'description', type: 'text', nullable: true, primaryKey: false },
      { name: 'owner_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'users', column: 'id' } },
      { name: 'status', type: 'varchar(20)', nullable: false, primaryKey: false, defaultValue: 'active' },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    relationships: []
  },
  {
    id: '3',
    name: 'tasks',
    schema: 'public',
    position: { x: 800, y: 100 },
    selected: false,
    rowCount: 2156,
    description: 'Project tasks and todos',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'title', type: 'varchar(300)', nullable: false, primaryKey: false },
      { name: 'description', type: 'text', nullable: true, primaryKey: false },
      { name: 'project_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'projects', column: 'id' } },
      { name: 'assignee_id', type: 'uuid', nullable: true, primaryKey: false, foreignKey: { table: 'users', column: 'id' } },
      { name: 'status', type: 'varchar(20)', nullable: false, primaryKey: false, defaultValue: 'todo' },
      { name: 'priority', type: 'varchar(10)', nullable: false, primaryKey: false, defaultValue: 'medium' },
      { name: 'due_date', type: 'timestamp', nullable: true, primaryKey: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    relationships: []
  },
  {
    id: '4',
    name: 'comments',
    schema: 'public',
    position: { x: 450, y: 400 },
    selected: false,
    rowCount: 5432,
    description: 'Task comments and discussions',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primaryKey: true, defaultValue: 'gen_random_uuid()' },
      { name: 'content', type: 'text', nullable: false, primaryKey: false },
      { name: 'task_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'tasks', column: 'id' } },
      { name: 'author_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: { table: 'users', column: 'id' } },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, defaultValue: 'now()' }
    ],
    relationships: []
  }
]

const mockRelationships: Relationship[] = [
  { id: '1', fromTable: 'projects', fromColumn: 'owner_id', toTable: 'users', toColumn: 'id', type: 'many-to-one' },
  { id: '2', fromTable: 'tasks', fromColumn: 'project_id', toTable: 'projects', toColumn: 'id', type: 'many-to-one' },
  { id: '3', fromTable: 'tasks', fromColumn: 'assignee_id', toTable: 'users', toColumn: 'id', type: 'many-to-one' },
  { id: '4', fromTable: 'comments', fromColumn: 'task_id', toTable: 'tasks', toColumn: 'id', type: 'many-to-one' },
  { id: '5', fromTable: 'comments', fromColumn: 'author_id', toTable: 'users', toColumn: 'id', type: 'many-to-one' }
]

function getTypeIcon(type: string) {
  if (type.includes('varchar') || type.includes('text')) return Type
  if (type.includes('int') || type.includes('serial')) return Hash
  if (type.includes('timestamp') || type.includes('date')) return Calendar
  if (type.includes('uuid')) return Key
  return Box
}

function TableCard({ 
  table, 
  onSelect, 
  onMove, 
  relationships,
  viewMode = 'visual'
}: { 
  table: Table
  onSelect: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  relationships: Relationship[]
  viewMode?: 'visual' | 'list'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showColumns, setShowColumns] = useState(true)

  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-medium text-sm text-zinc-900 dark:text-white">{table.name}</div>
              <div className="text-xs text-zinc-500">{table.schema}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {table.columns.length} columns
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {table.rowCount?.toLocaleString() || '-'} rows
        </td>
        <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          {table.description || '-'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <Eye className="w-3 h-3" />
            </button>
            <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <Edit3 className="w-3 h-3" />
            </button>
            <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <Code className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - table.position.x, y: e.clientY - table.position.y })
    onSelect(table.id)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onMove(table.id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart, table.id, onMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const tableRelationships = relationships.filter(
    rel => rel.fromTable === table.name || rel.toTable === table.name
  )

  return (
    <div
      className={`absolute bg-white dark:bg-zinc-800 rounded-lg border-2 shadow-lg min-w-[250px] cursor-move ${
        table.selected ? 'border-blue-500' : 'border-zinc-200 dark:border-zinc-700'
      }`}
      style={{ left: table.position.x, top: table.position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Table Header */}
      <div className={`p-3 border-b border-zinc-200 dark:border-zinc-700 ${table.selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{table.name}</h3>
              <p className="text-xs text-zinc-500">{table.schema}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowColumns(!showColumns)}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              {showColumns ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            <div className="relative group">
              <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
                <MoreVertical className="w-3 h-3" />
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  View Data
                </button>
                <button className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                  <Edit3 className="w-3 h-3" />
                  Edit Schema
                </button>
                <button className="w-full px-3 py-2 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  View DDL
                </button>
              </div>
            </div>
          </div>
        </div>
        {table.description && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{table.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
          <span>{table.columns.length} columns</span>
          {table.rowCount && <span>{table.rowCount.toLocaleString()} rows</span>}
          <span>{tableRelationships.length} relations</span>
        </div>
      </div>

      {/* Columns */}
      {showColumns && (
        <div className="max-h-60 overflow-y-auto">
          {table.columns.map((column, index) => {
            const TypeIcon = getTypeIcon(column.type)
            return (
              <div
                key={index}
                className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="w-3 h-3 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {column.name}
                    </span>
                    {column.primaryKey && <Key className="w-3 h-3 text-yellow-500" title="Primary Key" />}
                    {column.foreignKey && <Link className="w-3 h-3 text-blue-500" title="Foreign Key" />}
                  </div>
                  {!column.nullable && <span className="text-xs text-red-500">NOT NULL</span>}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {column.type}
                  {column.defaultValue && ` = ${column.defaultValue}`}
                </div>
                {column.foreignKey && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    → {column.foreignKey.table}.{column.foreignKey.column}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RelationshipLine({ relationship, tables }: { relationship: Relationship; tables: Table[] }) {
  const fromTable = tables.find(t => t.name === relationship.fromTable)
  const toTable = tables.find(t => t.name === relationship.toTable)

  if (!fromTable || !toTable) return null

  const fromX = fromTable.position.x + 125
  const fromY = fromTable.position.y + 50
  const toX = toTable.position.x + 125
  const toY = toTable.position.y + 50

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#6b7280"
          />
        </marker>
      </defs>
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className="drop-shadow-sm"
      />
      <text
        x={(fromX + toX) / 2}
        y={(fromY + toY) / 2 - 10}
        fill="#6b7280"
        fontSize="10"
        textAnchor="middle"
        className="pointer-events-none"
      >
        {relationship.type}
      </text>
    </svg>
  )
}

export default function DatabaseSchemaPage() {
  const [tables, setTables] = useState<Table[]>(mockTables)
  const [relationships] = useState<Relationship[]>(mockRelationships)
  const [viewMode, setViewMode] = useState<'visual' | 'list' | 'ddl'>('visual')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchema, setSelectedSchema] = useState('public')
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTableSelect = (id: string) => {
    setTables(prev => prev.map(table => ({
      ...table,
      selected: table.id === id ? !table.selected : false
    })))
  }

  const handleTableMove = (id: string, position: { x: number; y: number }) => {
    setTables(prev => prev.map(table =>
      table.id === id ? { ...table, position } : table
    ))
  }

  const filteredTables = tables.filter(table => {
    if (selectedSchema !== 'all' && table.schema !== selectedSchema) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return table.name.toLowerCase().includes(query) ||
             table.columns.some(col => col.name.toLowerCase().includes(query))
    }
    return true
  })

  const schemas = Array.from(new Set(tables.map(t => t.schema)))

  const generateDDL = (table: Table) => {
    const columnDefs = table.columns.map(col => {
      let def = `  ${col.name} ${col.type}`
      if (!col.nullable) def += ' NOT NULL'
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
      return def
    }).join(',\n')

    const primaryKeys = table.columns.filter(col => col.primaryKey).map(col => col.name)
    let ddl = `CREATE TABLE ${table.schema}.${table.name} (\n${columnDefs}`
    
    if (primaryKeys.length > 0) {
      ddl += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`
    }
    
    ddl += '\n);'
    
    // Add foreign key constraints
    const foreignKeys = table.columns.filter(col => col.foreignKey)
    if (foreignKeys.length > 0) {
      ddl += '\n\n-- Foreign Key Constraints\n'
      foreignKeys.forEach(col => {
        ddl += `ALTER TABLE ${table.schema}.${table.name} ADD CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${col.foreignKey!.table}(${col.foreignKey!.column});\n`
      })
    }
    
    return ddl
  }

  return (
    <>
      <HeroPattern />
      <div className="max-w-[95vw] mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Database Schema Designer</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Visual database schema designer with DDL generation and relationship mapping
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button variant="filled" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Table
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Tables</p>
                  <p className="text-2xl font-bold">{tables.length}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Columns</p>
                  <p className="text-2xl font-bold">{tables.reduce((acc, t) => acc + t.columns.length, 0)}</p>
                </div>
                <Type className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Relationships</p>
                  <p className="text-2xl font-bold">{relationships.length}</p>
                </div>
                <GitBranch className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Rows</p>
                  <p className="text-2xl font-bold">
                    {tables.reduce((acc, t) => acc + (t.rowCount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Hash className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search tables and columns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
              
              <select
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value)}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                <option value="all">All Schemas</option>
                {schemas.map(schema => (
                  <option key={schema} value={schema}>{schema}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'visual' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  Visual
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('ddl')}
                  className={`px-3 py-1 rounded text-sm ${viewMode === 'ddl' ? 'bg-blue-500 text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                >
                  DDL
                </button>
              </div>

              {viewMode === 'visual' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 mx-2">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'visual' && (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div
              ref={containerRef}
              className="relative h-[800px] overflow-auto"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Relationships */}
              {relationships.map(relationship => (
                <RelationshipLine
                  key={relationship.id}
                  relationship={relationship}
                  tables={filteredTables}
                />
              ))}

              {/* Tables */}
              {filteredTables.map(table => (
                <TableCard
                  key={table.id}
                  table={table}
                  onSelect={handleTableSelect}
                  onMove={handleTableMove}
                  relationships={relationships}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Table</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Columns</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Rows</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {filteredTables.map(table => (
                    <TableCard
                      key={table.id}
                      table={table}
                      onSelect={handleTableSelect}
                      onMove={handleTableMove}
                      relationships={relationships}
                      viewMode="list"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'ddl' && (
          <div className="space-y-6">
            {filteredTables.map(table => (
              <div key={table.id} className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {table.schema}.{table.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="text-xs">
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-sm bg-zinc-50 dark:bg-zinc-900 p-4 rounded overflow-x-auto">
                    <code>{generateDDL(table)}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}