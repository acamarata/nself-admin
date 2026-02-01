'use client'

import { NotificationPreferences } from '@/components/notifications'
import { Button } from '@/components/ui/button'
import { PageContent } from '@/components/ui/page-content'
import { PageHeader } from '@/components/ui/page-header'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotificationSettingsPage() {
  return (
    <>
      <PageHeader
        title="Notification Settings"
        description="Configure how you receive notifications"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Notifications', href: '/notifications' },
          { label: 'Settings' },
        ]}
        actions={
          <Link href="/notifications">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Notifications
            </Button>
          </Link>
        }
      />
      <PageContent>
        <NotificationPreferences />
      </PageContent>
    </>
  )
}
