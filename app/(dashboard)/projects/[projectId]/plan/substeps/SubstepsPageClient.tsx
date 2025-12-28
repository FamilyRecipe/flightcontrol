'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { FileText } from 'lucide-react'

export function SubstepsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Substeps"
        description="Manage substeps for your project plan"
      />
      <EmptyState
        icon={FileText}
        title="Substeps Management"
        description="Substeps management interface coming soon. This will allow you to view and manage all substeps across your plan."
        variant="card"
      />
    </div>
  )
}

