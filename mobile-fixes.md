# Mobile Optimization Implementation Plan

## Page 1: /config/env - Variable Editor Table

### Current State

- 3-column table (Key, Value, Actions)
- Difficult to edit on mobile
- Action buttons too small for touch

### Implementation

1. Wrap existing table in `<div className="hidden md:block">`
2. Add mobile card view below with `<div className="md:hidden">`
3. Each variable becomes a card with:
   - Header: Key name + action buttons (40x40px touch targets)
   - Body: Value (with edit mode inline)
   - Footer: Badges (source, secret, modified)

### Code Pattern

```tsx
{
  !isCollapsed && (
    <>
      {/* Desktop: Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">{/* existing table code */}</table>
      </div>

      {/* Mobile: Cards */}
      <div className="space-y-3 md:hidden">
        {vars.map((variable) => (
          <MobileVariableCard
            key={variable.key}
            variable={variable}
            {...actions}
          />
        ))}
      </div>
    </>
  )
}
```

## Page 2: /database/console - SQL Query Results

### Current State

- Wide results table with many columns
- Overflows horizontally on mobile

### Implementation

1. Wrap `<ResultsTable>` component in `<ScrollContainer>`
2. Add scroll indicator for mobile users
3. Ensure horizontal scroll is smooth

### Code Pattern

```tsx
import { ScrollContainer } from '@/components/ui/responsive-table'

{
  /* Results */
}
{
  result && !error && (
    <ScrollContainer className="mt-6">
      <ResultsTable result={result} />
    </ScrollContainer>
  )
}
```

## Page 3: /system/resources - Process Manager

### Current State

- 8-column table (PID, Process, User, CPU, Memory, Runtime, Status, Actions)
- Completely unusable on mobile

### Implementation

1. Replace with `<ResponsiveTable>` component
2. Create `ProcessMobileCard` component
3. Show only key metrics on mobile

### Code Pattern

```tsx
import { ResponsiveTable, MobileDataCard } from '@/components/ui/responsive-table'

const ProcessMobileCard = ({ data: process }) => (
  <MobileDataCard
    title={process.name}
    subtitle={`PID: ${process.pid} | User: ${process.user}`}
    data={[
      { label: 'CPU', value: `${process.cpuUsage.toFixed(1)}%` },
      { label: 'Memory', value: `${(process.memoryUsage / 1024 ** 2).toFixed(1)} MB` },
      { label: 'Runtime', value: formatUptime(process.runtime) },
      { label: 'Status', value: process.status }
    ]}
    actions={
      <>
        <button onClick={() => onProcessAction('restart', process.pid)}>Restart</button>
        <button onClick={() => onProcessAction('kill', process.pid)}>Kill</button>
      </>
    }
  />
)

<ResponsiveTable
  data={filteredProcesses}
  columns={tableColumns}
  mobileCard={ProcessMobileCard}
/>
```

## Page 4: /tools/graphql - GraphQL Playground

### Current State

- Side-by-side panels (query editor left, results right)
- Cramped on mobile

### Implementation

1. Change grid from `grid-cols-2` to `flex-col md:flex-row`
2. Stack vertically on mobile
3. Ensure both panels are usable

### Code Pattern

```tsx
{
  /* Query Editor */
}
;<div className="flex flex-col gap-6 lg:flex-row">
  {/* Query List */}
  <div className="w-full lg:w-80">{/* sidebar */}</div>

  {/* Query Editor */}
  <div className="flex-1">
    <div className="grid h-96 grid-cols-1 lg:grid-cols-2">
      {/* Query input */}
      <div>...</div>
      {/* Variables/Headers */}
      <div className="flex flex-col">...</div>
    </div>
  </div>
</div>
```

## Testing Checklist

- [ ] Test on 375px (iPhone SE)
- [ ] Test on 768px (iPad)
- [ ] Verify touch targets ≥44px
- [ ] No horizontal scrolling (except intentional scroll containers)
- [ ] All actions accessible on mobile
- [ ] TypeScript passing
- [ ] Lint passing
