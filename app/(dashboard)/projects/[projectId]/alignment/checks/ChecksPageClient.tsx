'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { CheckCircle2 } from 'lucide-react'

export function ChecksPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Alignment Checks"
        description="View all alignment checks and their results"
      />
      <EmptyState
        icon={CheckCircle2}
        title="Alignment Checks"
        description="Alignment checks list coming soon. This will show all alignment checks performed on your project, filterable by step, date, and status."
        variant="card"
      />
    </div>
  )
}

