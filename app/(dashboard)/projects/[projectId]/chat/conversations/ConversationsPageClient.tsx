'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { MessageSquare } from 'lucide-react'

export function ConversationsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations"
        description="Manage misalignment conversations"
      />
      <EmptyState
        icon={MessageSquare}
        title="Misalignment Conversations"
        description="Conversations interface coming soon. This will show all active misalignment conversations that require your attention and responses."
        variant="card"
      />
    </div>
  )
}

