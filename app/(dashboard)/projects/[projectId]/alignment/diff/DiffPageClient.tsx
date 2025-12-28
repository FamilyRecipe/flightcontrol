'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { GitCompare } from 'lucide-react'

export function DiffPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Diff View"
        description="Compare plan vs reality with visual diff"
      />
      <EmptyState
        icon={GitCompare}
        title="Diff View"
        description="Diff view interface coming soon. This will provide a visual comparison between your project plan and the actual implementation in your repository."
        variant="card"
      />
    </div>
  )
}

