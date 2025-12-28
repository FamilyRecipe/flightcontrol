'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GitBranch, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/db/queries'

interface BranchSelectorProps {
  project: Project
  className?: string
}

export function BranchSelector({ project, className }: BranchSelectorProps) {
  // TODO: Add tracked_branch to Project schema
  const currentBranch = 'main' // Hardcoded for now
  const environment = project.experimental_mode ? 'EXPERIMENTAL' : 'PRODUCTION'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <GitBranch className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentBranch}</span>
          <Badge
            variant={project.experimental_mode ? 'secondary' : 'default'}
            className="text-xs"
          >
            {environment}
          </Badge>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Branch & Environment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <GitBranch className="mr-2 h-4 w-4" />
          <span>main</span>
          <Badge variant="outline" className="ml-auto text-xs">
            Current
          </Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            Branch tracking coming soon...
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

