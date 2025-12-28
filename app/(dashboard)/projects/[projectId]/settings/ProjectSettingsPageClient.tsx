'use client'

import { PageHeader } from '@/components/templates/layout/PageHeader'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { Settings } from 'lucide-react'

export function ProjectSettingsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader title="Project Settings" description="Configure project settings and preferences" />
      <EmptyState
        icon={Settings}
        title="Coming Soon"
        description="Project settings configuration will be available soon."
        variant="card"
      />
    </div>
  )
}

