'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { GitBranch } from 'lucide-react'

export function WebhooksPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Configure GitHub webhooks for automatic commit tracking"
      />
      <EmptyState
        icon={GitBranch}
        title="Webhook Configuration"
        description="Webhook configuration interface coming soon. This will allow you to manage GitHub webhooks for automatic commit tracking and alignment checks."
        variant="card"
      />
    </div>
  )
}

