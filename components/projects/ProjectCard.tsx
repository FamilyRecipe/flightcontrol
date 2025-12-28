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
      <Card className="group transition-all hover:border-primary/50 hover:shadow-md cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FolderGit2 className="h-5 w-5 text-primary" />
            </div>
            {project.experimental_mode && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Experimental
              </Badge>
            )}
          </div>
          <CardTitle className="text-sm font-semibold leading-tight">{project.github_repo_name}</CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {project.github_repo_owner}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

