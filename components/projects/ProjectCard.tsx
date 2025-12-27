'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Project } from '@/lib/db/queries'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>{project.github_repo_full_name}</CardTitle>
          <CardDescription>
            {project.experimental_mode && (
              <span className="text-yellow-600">Experimental Mode</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

