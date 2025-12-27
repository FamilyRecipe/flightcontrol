'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderGit2, Clock } from 'lucide-react'
import type { Project } from '@/lib/db/queries'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition-all hover:bg-accent cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <FolderGit2 className="h-5 w-5 text-muted-foreground" />
            {project.experimental_mode && (
              <Badge variant="outline" className="text-xs">
                Experimental
              </Badge>
            )}
          </div>
          <CardTitle className="mt-2">{project.github_repo_name}</CardTitle>
          <CardDescription className="text-xs">
            {project.github_repo_owner}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(project.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

