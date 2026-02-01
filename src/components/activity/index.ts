/**
 * Activity feed components
 *
 * @example
 * ```tsx
 * import { ActivityFeed, ActivityItem, ActivityFilter, ActivityTimeline } from '@/components/activity'
 *
 * // Full activity feed with filters
 * <ActivityFeed showFilter limit={20} />
 *
 * // Timeline visualization
 * <ActivityTimeline groupByDate limit={10} />
 *
 * // Single activity item
 * <ActivityItem activity={activity} />
 *
 * // Standalone filter
 * <ActivityFilter value={filter} onChange={setFilter} />
 * ```
 */

export { ActivityFeed } from './ActivityFeed'
export type { ActivityFeedProps } from './ActivityFeed'

export { ActivityFilter } from './ActivityFilter'
export type { ActivityFilterProps } from './ActivityFilter'

export { ActivityItem } from './ActivityItem'
export type { ActivityItemProps } from './ActivityItem'

export { ActivityTimeline } from './ActivityTimeline'
export type { ActivityTimelineProps } from './ActivityTimeline'
