'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useProject } from '@/contexts/ProjectContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Plus, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Project } from '@/lib/db/queries'

interface ProjectSelectorProps {
  currentProject: Project | null
  projects: Project[]
  onProjectChange?: (project: Project) => void
}

export function ProjectSelector({ currentProject, projects, onProjectChange }: ProjectSelectorProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    const query = searchQuery.toLowerCase()
    return projects.filter(
      (project) =>
        project.github_repo_name.toLowerCase().includes(query) ||
        project.github_repo_full_name.toLowerCase().includes(query)
    )
  }, [projects, searchQuery])

  const handleProjectSelect = (project: Project) => {
    setOpen(false)
    router.push(`/projects/${project.id}`)
    // ProjectContext will sync with URL automatically via useEffect
    onProjectChange?.(project)
  }

  const displayName = currentProject
    ? currentProject.github_repo_name || currentProject.github_repo_full_name
    : 'Select Project'

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className="hidden sm:inline">{displayName}</span>
          <span className="sm:hidden">Project</span>
          {currentProject?.experimental_mode && (
            <Badge variant="secondary" className="text-xs">
              EXPERIMENTAL
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        {projects.length > 5 && (
          <div className="px-2 py-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
        )}
        <DropdownMenuSeparator />
        {filteredProjects.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {filteredProjects.map((project) => {
              const isCurrent = currentProject?.id === project.id
              const displayName = project.github_repo_name || project.github_repo_full_name

              return (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={cn(
                    'flex items-center justify-between cursor-pointer',
                    isCurrent && 'bg-accent'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isCurrent && <Check className="h-4 w-4 text-primary shrink-0" />}
                    <span className={cn('truncate', !isCurrent && 'ml-6')}>{displayName}</span>
                  </div>
                  {project.experimental_mode && (
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      EXP
                    </Badge>
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/projects/new" className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

