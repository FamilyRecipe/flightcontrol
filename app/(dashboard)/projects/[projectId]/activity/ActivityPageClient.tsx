'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { Activity } from 'lucide-react'

export function ActivityPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="View recent project activity and events"
      />
      <EmptyState
        icon={Activity}
        title="Activity Feed"
        description="Activity feed coming soon. This will show a chronological feed of all commits, alignment checks, and other project events."
        variant="card"
      />
    </div>
  )
}

