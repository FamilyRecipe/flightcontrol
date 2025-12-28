'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { History } from 'lucide-react'

export function ChatHistoryPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat History"
        description="View past chat conversations and messages"
      />
      <EmptyState
        icon={History}
        title="Chat History"
        description="Chat history interface coming soon. This will display all past chat conversations and messages, with search functionality."
        variant="card"
      />
    </div>
  )
}

