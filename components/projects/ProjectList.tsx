'use client'

import { useProject } from '@/contexts/ProjectContext'
import { ProjectCard } from './ProjectCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function ProjectList() {
  const { projects, loading } = useProject()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 border-2 border-dashed rounded-lg">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first project
          </p>
        </div>
        <Link href="/projects/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>
        </Link>
      </div>
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

