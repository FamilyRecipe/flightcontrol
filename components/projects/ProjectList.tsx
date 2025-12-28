'use client'

import { useProject } from '@/contexts/ProjectContext'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { LoadingState } from '@/components/templates/states/LoadingState'
import { Plus } from 'lucide-react'

export function ProjectList() {
  const { projects, loading } = useProject()

  if (loading) {
    return <LoadingState message="Loading projects..." />
  }

  if (projects.length === 0) {
    return (
      <>
        <EmptyState
          icon={Plus}
          title="No projects yet"
          description="Connect a GitHub repository to start tracking alignment between your code and project plans. Create your first project to get started."
          action={{
            label: 'Create Your First Project',
            href: '/projects/new',
          }}
          variant="card"
        />
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Need help? <a href="/settings" className="text-primary hover:underline">Configure GitHub integration</a>
        </p>
      </>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

