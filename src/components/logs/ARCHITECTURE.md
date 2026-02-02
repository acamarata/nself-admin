# Logs Viewer Architecture

## Component Hierarchy

```
/logs (page.tsx)
├── HeroPattern
├── Header
│   ├── Connection Status Indicator
│   └── Actions (Refresh, Download, Share, Clear)
├── ServiceSelector
│   ├── Dropdown Button
│   └── Multi-Select Menu
│       ├── Recent Services
│       └── All Services List
├── LogFilters
│   ├── Search Input (with Regex Toggle)
│   ├── Level Select
│   ├── Time Range Select
│   └── Custom Time Range (conditional)
├── Log Insights (conditional)
│   ├── Error Count Badge
│   ├── Warning Count Badge
│   └── Repeated Patterns List
└── LogStream
    ├── Pause/Resume Button
    ├── Scroll to Bottom Button (conditional)
    ├── Virtual Scroller Container
    │   └── LogLine (virtualized)
    │       ├── Timestamp
    │       ├── Level Badge
    │       ├── Service Name
    │       └── Message
    └── Buffer Warning (conditional)
```

## Data Flow

### 1. Initial Load

```
User opens /logs
  ↓
Page loads services from API
  GET /api/project/services-detail
  ↓
Services populate ServiceSelector
  ↓
WebSocket client connects
  ↓
User selects service(s)
  ↓
WebSocket joins room(s): logs:postgres, logs:all
```

### 2. Real-time Streaming

```
Service emits log to stdout/stderr
  ↓
Docker captures log
  ↓
nself CLI polls docker logs
  ↓
API route receives log line
  POST /api/logs/stream
  ↓
Log parsed for level (info/warn/error/debug)
  ↓
WebSocket server broadcasts LogStreamEvent
  EventType.LOGS_STREAM
  ↓
Client receives event
  wsClient.on(LOGS_STREAM, handler)
  ↓
Log added to buffer
  setBufferedLogs([...prev, newLog])
  ↓
Throttle interval (100ms)
  Take 10 logs from buffer
  ↓
Add to main logs state (max 10k)
  setLogs([...prev, ...batch].slice(-10000))
  ↓
Filters applied (memoized)
  - Service filter
  - Level filter
  - Time range filter
  - Search text filter
  ↓
Virtual scroller renders visible logs
  @tanstack/react-virtual
  ↓
User sees logs in UI
```

### 3. User Actions

#### Filter Logs

```
User types search text
  ↓
setFilters({ ...filters, searchText: "error" })
  ↓
useMemo recalculates filtered logs
  ↓
Virtual scroller re-renders with new subset
```

#### Download Logs

```
User clicks Download
  ↓
Take last 1000 filtered logs
  ↓
Format as plain text
  [timestamp] [service] [level] message
  ↓
Create Blob and download file
  logs-{timestamp}.txt
```

#### Share Link

```
User clicks Share
  ↓
Build URL with query params
  ?services=postgres,hasura&level=error&search=timeout
  ↓
Copy to clipboard
```

## State Management

### Component State

```typescript
// Main logs state
const [logs, setLogs] = useState<LogEntry[]>([])

// Throttle buffer
const [bufferedLogs, setBufferedLogs] = useState<LogEntry[]>([])

// Service selection
const [selectedServices, setSelectedServices] = useState<string[]>([])
const [recentServices, setRecentServices] = useState<string[]>([])

// Filters
const [filters, setFilters] = useState<LogFiltersType>({
  searchText: '',
  level: 'all',
  timeRange: '5m',
  regexEnabled: false,
})

// UI state
const [autoScroll, setAutoScroll] = useState(true)
const [isLoading, setIsLoading] = useState(true)
const [connectionStatus, setConnectionStatus] = useState('connecting')
```

### Derived State (Memoized)

```typescript
// Filtered logs (expensive operation)
const filteredLogs = useMemo(() => {
  let result = logs

  // Apply service filter
  if (selectedServices.length > 0) {
    result = result.filter((log) => selectedServices.includes(log.service))
  }

  // Apply level filter
  if (filters.level !== 'all') {
    result = result.filter((log) => log.level === filters.level)
  }

  // Apply time range filter
  // ...

  // Apply search filter
  if (filters.searchText) {
    // regex or plain text
  }

  return result
}, [logs, selectedServices, filters])

// Log insights (derived from filtered logs)
const insights = useMemo((): LogInsights => {
  const errorCount = filteredLogs.filter((log) => log.level === 'error').length
  const warningCount = filteredLogs.filter((log) => log.level === 'warn').length
  const patterns = detectRepeatedErrors(filteredLogs)

  return { errorCount, warningCount, patterns }
}, [filteredLogs])
```

## Performance Strategy

### 1. Virtual Scrolling

- Only render ~20 visible log lines
- Use `@tanstack/react-virtual` for efficiency
- Estimated row height: 60px
- Overscan: 10 rows above/below viewport

### 2. Throttling

- Buffer incoming logs
- Process max 10 logs per 100ms
- = 100 logs/second max throughput
- Prevents UI freezing on log bursts

### 3. Buffer Management

- Keep max 10,000 logs in memory
- Automatically drop oldest logs
- Show warning when limit reached
- User can clear to reset buffer

### 4. Memoization

- Filter operations use `useMemo`
- Only recalculate when dependencies change
- Prevents unnecessary re-renders

### 5. WebSocket Rooms

- Only subscribe to selected services
- Join `logs:postgres` instead of `logs:all`
- Reduces network traffic
- Server-side filtering

## WebSocket Events

### Client → Server

```typescript
// Join room to receive logs
wsClient.joinRoom('logs:postgres')

// Leave room to stop receiving logs
wsClient.leaveRoom('logs:postgres')

// Heartbeat (automatic)
wsClient.emit(EventType.HEARTBEAT)
```

### Server → Client

```typescript
// Log stream event
{
  type: EventType.LOGS_STREAM,
  data: {
    service: 'postgres',
    line: 'Connection established',
    timestamp: '2024-01-31T12:00:00Z',
    level: 'info',
    source: 'stdout'
  },
  timestamp: '2024-01-31T12:00:00Z',
  room: 'logs:postgres'
}

// Connection events
EventType.CONNECT
EventType.DISCONNECT
EventType.PONG
```

## Error Handling

### WebSocket Errors

```typescript
// Connection lost
connectionStatus = 'disconnected'
  ↓
Show error state: "Connection lost. Reconnecting..."
  ↓
Auto-reconnect with exponential backoff
  Delays: 1s, 2s, 4s, 8s, 16s
  ↓
Reconnect successful
  connectionStatus = 'connected'
```

### API Errors

```typescript
// Failed to load services
try {
  const res = await fetch('/api/project/services-detail')
  if (!res.ok) throw new Error('Failed to load')
} catch (error) {
  setIsLoading(false)
  // Show empty state with error message
}
```

### Filter Errors

```typescript
// Invalid regex
if (filters.regexEnabled) {
  try {
    const regex = new RegExp(filters.searchText, 'i')
    // Use regex
  } catch {
    // Fall back to plain text search
  }
}
```

## Mobile Optimizations

### Responsive Layout

```css
/* Desktop: Full layout */
@media (min-width: 1024px) {
  .log-line {
    font-size: 13px;
  }
}

/* Mobile: Compact layout */
@media (max-width: 640px) {
  .log-line {
    font-size: 11px;
    padding: 0.5rem;
  }

  .log-timestamp {
    font-size: 10px;
  }
}
```

### Touch Interactions

- Larger tap targets (min 44x44px)
- Touch-friendly dropdowns
- Horizontal scroll for long lines
- Swipe gestures (future enhancement)

## Testing Strategy

### Unit Tests

Test individual components in isolation:

```typescript
// LogLine
✓ Renders log entry correctly
✓ Displays error level with correct styling
✓ Parses JSON logs correctly
✓ Hides service name when showService=false

// ServiceSelector
✓ Renders with no services selected
✓ Displays single selected service name
✓ Displays count for multiple services
✓ Opens dropdown on click
✓ Toggles service selection
✓ Selects all services
✓ Clears all selections

// LogFilters
✓ Renders all filter controls
✓ Updates search text
✓ Toggles regex mode
✓ Changes log level filter
✓ Changes time range filter
✓ Clears all filters
```

### Integration Tests

Test component interactions:

```typescript
// WebSocket connection
✓ Connects on mount
✓ Receives log events
✓ Updates state correctly
✓ Reconnects on disconnect

// Filtering
✓ Service filter works
✓ Level filter works
✓ Search filter works
✓ Multiple filters combine correctly
```

### Performance Tests

Test with large datasets:

```typescript
// Virtual scrolling
✓ Renders 10k logs without lag
✓ Scrolling is smooth
✓ Memory usage stays reasonable

// Throttling
✓ Handles 100+ logs/sec burst
✓ UI stays responsive
✓ No dropped logs
```

## Security Considerations

### Input Validation

- Search text is escaped before regex compilation
- No eval() or dangerous operations
- All user input sanitized

### WebSocket Security

- Authenticated via session cookie
- Room access control
- Rate limiting on server

### Data Privacy

- No sensitive data in logs (CLI handles this)
- Logs stay in memory, not persisted
- Clear logs removes from UI only

## Future Improvements

### Planned Features

1. **Advanced Search**
   - Multi-keyword search
   - Exclude patterns
   - Case-sensitive toggle

2. **Export Formats**
   - JSON export with metadata
   - CSV for spreadsheet analysis
   - HTML with syntax highlighting

3. **Saved Views**
   - Save filter presets
   - Quick access to common searches
   - Share views with team

4. **Log Analytics**
   - Aggregate error trends
   - Service health dashboard
   - Alert on error spikes

5. **Performance**
   - IndexedDB for log persistence
   - Web Worker for filtering
   - WebAssembly for regex

### Known Limitations

1. **Buffer Limit**: Max 10k logs (by design for performance)
2. **Search**: Client-side only (server-side search in future)
3. **Export**: Max 1000 lines (could be increased)
4. **History**: No persistent log storage (could add)

---

**Version**: 1.0.0
**Last Updated**: January 31, 2026
**Maintainer**: nself-admin team
