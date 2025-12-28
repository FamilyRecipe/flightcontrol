'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { History } from 'lucide-react'

export function HistoryPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan History"
        description="View plan version history and changes over time"
      />
      <EmptyState
        icon={History}
        title="Plan History"
        description="Plan version history coming soon. This will show all changes and updates to your project plan over time."
        variant="card"
      />
    </div>
  )
}

