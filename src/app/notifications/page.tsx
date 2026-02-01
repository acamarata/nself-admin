'use client'

import { NotificationItem } from '@/components/notifications'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContent } from '@/components/ui/page-content'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useNotificationStats,
} from '@/hooks/useNotifications'
import { Bell, BellOff, CheckCheck, Loader2, Settings } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const {
    notifications,
    isLoading,
    total,
    refresh: refreshNotifications,
  } = useNotifications({
    unreadOnly: filter === 'unread',
  })

  const { stats, refresh: refreshStats } = useNotificationStats()
  const { markAsRead } = useMarkAsRead()
  const { markAllAsRead, isLoading: isMarkingAllRead } = useMarkAllAsRead()
  const { deleteNotification } = useDeleteNotification()

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    refreshNotifications()
    refreshStats()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    refreshNotifications()
    refreshStats()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    refreshNotifications()
    refreshStats()
  }

  const unreadCount = stats?.unread ?? 0
  const highPriorityCount =
    (stats?.byPriority?.high ?? 0) + (stats?.byPriority?.urgent ?? 0)

  return (
    <>
      <PageHeader
        title="Notifications"
        description="View and manage your notifications"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-4 w-4" />
                )}
                Mark all as read
              </Button>
            )}
            <Link href="/notifications/settings">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        }
      />
      <PageContent>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Notifications"
            value={total}
            icon={Bell}
            isLoading={isLoading}
          />
          <StatCard
            title="Unread"
            value={unreadCount}
            icon={Bell}
            iconColor="bg-blue-500"
            isLoading={isLoading}
          />
          <StatCard
            title="High Priority"
            value={highPriorityCount}
            icon={Bell}
            iconColor="bg-orange-500"
            isLoading={isLoading}
          />
          <StatCard
            title="Read"
            value={total - unreadCount}
            icon={CheckCheck}
            isLoading={isLoading}
          />
        </div>

        {/* Notifications List */}
        <Card className="overflow-hidden">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as 'all' | 'unread')}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
              <TabsList className="border-0 bg-transparent">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800"
                >
                  All ({total})
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800"
                >
                  Unread ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon={BellOff}
                  title="No notifications"
                  description="You're all caught up! New notifications will appear here."
                  className="border-0"
                />
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon={CheckCheck}
                  title="All caught up!"
                  description="You have no unread notifications."
                  className="border-0"
                />
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </PageContent>
    </>
  )
}
