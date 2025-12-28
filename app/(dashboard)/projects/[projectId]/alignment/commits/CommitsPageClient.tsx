'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { GitCommit } from 'lucide-react'

export function CommitsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Commits"
        description="Review commits and their alignment status"
      />
      <EmptyState
        icon={GitCommit}
        title="Commit History"
        description="Commit review interface coming soon. This will display all commits with their alignment status and allow you to review alignment details for each commit."
        variant="card"
      />
    </div>
  )
}

