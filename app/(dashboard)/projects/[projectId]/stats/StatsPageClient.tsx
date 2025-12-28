'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { BarChart3 } from 'lucide-react'

export function StatsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stats"
        description="View project statistics and metrics"
      />
      <EmptyState
        icon={BarChart3}
        title="Project Statistics"
        description="Statistics dashboard coming soon. This will display comprehensive metrics about your project's progress, alignment status, and activity."
        variant="card"
      />
    </div>
  )
}

