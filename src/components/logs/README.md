# Logs Viewer Components

Production-ready real-time log streaming interface for nself-admin.

## Overview

The logs viewer provides a comprehensive interface for viewing, filtering, and analyzing service logs in real-time via WebSocket connections.

## Components

### LogLine

Displays a single log entry with syntax highlighting and metadata.

**Features:**

- Timestamp display (absolute + relative)
- Service name color-coding
- Log level badge (INFO, WARN, ERROR, DEBUG)
- JSON syntax highlighting
- Responsive design

**Props:**

```typescript
interface LogLineProps {
  log: LogEntry
  showService?: boolean
}

interface LogEntry {
  id: string
  service: string
  line: string
  timestamp: string
  level?: 'info' | 'warn' | 'error' | 'debug'
  source?: 'stdout' | 'stderr'
}
```

**Example:**

```tsx
<LogLine
  log={{
    id: '1',
    service: 'postgres',
    line: 'Connection established',
    timestamp: new Date().toISOString(),
    level: 'info',
  }}
/>
```

### ServiceSelector

Multi-select dropdown for choosing which services to view logs from.

**Features:**

- Multi-service selection
- Select All / Clear All buttons
- Recent services quick access
- Checkbox UI for each service
- Click outside to close

**Props:**

```typescript
interface ServiceSelectorProps {
  services: string[]
  selectedServices: string[]
  onChange: (services: string[]) => void
  recentServices?: string[]
}
```

**Example:**

```tsx
<ServiceSelector
  services={['postgres', 'hasura', 'auth']}
  selectedServices={['postgres']}
  onChange={(services) => console.log(services)}
  recentServices={['postgres', 'hasura']}
/>
```

### LogFilters

Comprehensive filtering controls for log search and filtering.

**Features:**

- Text search with regex support
- Log level filter (All, INFO, WARN, ERROR, DEBUG)
- Time range filter (5m, 1h, 24h, custom)
- Custom date/time range picker
- Active filter count display
- Clear all filters button

**Props:**

```typescript
interface LogFiltersProps {
  filters: LogFilters
  onChange: (filters: LogFilters) => void
  totalCount: number
  filteredCount: number
}

interface LogFilters {
  searchText: string
  level: 'all' | 'info' | 'warn' | 'error' | 'debug'
  timeRange: '5m' | '1h' | '24h' | 'custom'
  regexEnabled: boolean
  customStartTime?: Date
  customEndTime?: Date
}
```

**Example:**

```tsx
<LogFilters
  filters={{
    searchText: 'error',
    level: 'error',
    timeRange: '1h',
    regexEnabled: false,
  }}
  onChange={(filters) => console.log(filters)}
  totalCount={1000}
  filteredCount={50}
/>
```

### LogStream

Virtual scrolling container for efficient rendering of large log lists.

**Features:**

- Virtual scrolling for 10,000+ logs
- Auto-scroll to bottom
- Pause/Resume streaming
- Scroll to bottom button
- Buffer limit warning
- Performance optimized

**Props:**

```typescript
interface LogStreamProps {
  logs: LogEntry[]
  autoScroll?: boolean
  maxLogs?: number
  onAutoScrollChange?: (enabled: boolean) => void
}
```

**Example:**

```tsx
<LogStream
  logs={logEntries}
  autoScroll={true}
  maxLogs={10000}
  onAutoScrollChange={(enabled) => console.log('Auto-scroll:', enabled)}
/>
```

### LogViewerSkeleton

Loading skeleton for the logs viewer page.

**Example:**

```tsx
{
  isLoading ? <LogViewerSkeleton /> : <LogsContent />
}
```

## Main Page Implementation

The `/logs` page (`src/app/logs/page.tsx`) demonstrates full integration:

**Key Features:**

1. **WebSocket Integration**: Real-time log streaming via Socket.io
2. **Service Selection**: Filter logs by one or more services
3. **Advanced Filtering**: Text search, level, time range
4. **Log Insights**: Error/warning counts, pattern detection
5. **Performance**: Throttled updates (max 10 logs/100ms), buffer management
6. **Actions**: Download, clear, refresh, share
7. **Mobile Responsive**: Optimized for mobile devices

**State Management:**

```tsx
const [logs, setLogs] = useState<LogEntry[]>([])
const [bufferedLogs, setBufferedLogs] = useState<LogEntry[]>([])
const [filters, setFilters] = useState<LogFiltersType>({...})
const [selectedServices, setSelectedServices] = useState<string[]>([])
const [connectionStatus, setConnectionStatus] = useState('connecting')
```

**WebSocket Setup:**

```tsx
useEffect(() => {
  const wsClient = getWebSocketClient()
  wsClient.connect()

  wsClient.on<LogStreamEvent>(EventType.LOGS_STREAM, (event) => {
    // Add to buffer for throttling
    setBufferedLogs((prev) => [...prev, newLog])
  })

  return () => {
    wsClient.disconnect()
  }
}, [])
```

**Throttling:**

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    setBufferedLogs((buffer) => {
      const logsToAdd = buffer.slice(0, 10)
      setLogs((prev) => [...prev, ...logsToAdd].slice(-MAX_LOGS))
      return buffer.slice(10)
    })
  }, 100)

  return () => clearInterval(interval)
}, [])
```

## Performance Optimizations

1. **Virtual Scrolling**: Only renders visible logs using `@tanstack/react-virtual`
2. **Throttled Updates**: Max 10 logs per 100ms (100 logs/second)
3. **Buffer Management**: Keeps max 10,000 logs in memory
4. **Memoization**: Uses `useMemo` for expensive filtering operations
5. **Debounced Search**: Prevents excessive re-filtering

## API Routes

### GET /api/logs/stream

Starts WebSocket log streaming for a service.

**Query Parameters:**

- `service`: Service name (or 'all')
- `lines`: Number of historical lines (default: 100)
- `follow`: Follow mode (default: true)

**Response:**

```json
{
  "success": true,
  "message": "Log streaming started via WebSocket",
  "service": "postgres"
}
```

### POST /api/logs/stream

Get historical logs (non-streaming).

**Request Body:**

```json
{
  "service": "postgres",
  "lines": 100,
  "since": "2024-01-01T00:00:00Z",
  "until": "2024-01-31T23:59:59Z",
  "grep": "error"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": ["line1", "line2", "..."],
    "timestamp": "2024-01-31T12:00:00Z"
  }
}
```

## WebSocket Events

The logs viewer uses WebSocket events defined in `src/lib/websocket/events.ts`:

**Event Type:**

```typescript
EventType.LOGS_STREAM = 'logs:stream'
```

**Event Data:**

```typescript
interface LogStreamEvent {
  service: string
  line: string
  timestamp: string
  level?: 'info' | 'warn' | 'error' | 'debug'
  source?: 'stdout' | 'stderr'
}
```

**Room Names:**

- `logs:all` - All service logs
- `logs:postgres` - Specific service logs
- `logs:hasura` - Another service

## Testing

Unit tests are in `__tests__/LogsViewer.test.tsx`:

**Test Coverage:**

- LogLine rendering and styling
- ServiceSelector multi-select behavior
- LogFilters search and filtering
- Virtual scrolling performance
- WebSocket connection handling

**Run Tests:**

```bash
pnpm test src/components/logs/__tests__/LogsViewer.test.tsx
```

## Mobile Optimization

- Horizontal scroll for long log lines
- Smaller font sizes on mobile
- Touch-friendly controls
- Responsive filter layout

## Accessibility

- Keyboard navigation support
- ARIA labels for all interactive elements
- Screen reader friendly
- High contrast mode support

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- `@tanstack/react-virtual`: Virtual scrolling
- `socket.io-client`: WebSocket client
- `date-fns`: Date formatting
- `lucide-react`: Icons

## Future Enhancements

- [ ] Export to multiple formats (JSON, CSV, TXT)
- [ ] Saved filter presets
- [ ] Log bookmarks
- [ ] Full-text search with highlighting
- [ ] Log aggregation and analytics
- [ ] Custom color themes
- [ ] Log correlation across services
