'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { Link2 } from 'lucide-react'

export function IntegrationsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect external services and tools"
      />
      <EmptyState
        icon={Link2}
        title="Integrations"
        description="Integrations management coming soon. This will allow you to connect external services and tools to enhance your project workflow."
        variant="card"
      />
    </div>
  )
}

