'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { RefreshCw } from 'lucide-react'

export function UpdatesPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan Updates"
        description="Review and approve AI-suggested plan updates"
      />
      <EmptyState
        icon={RefreshCw}
        title="Plan Updates"
        description="Plan updates interface coming soon. This will show AI-suggested plan updates that require your review and approval."
        variant="card"
      />
    </div>
  )
}

