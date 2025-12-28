'use client'

import { Play, RefreshCw, Zap, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/db/queries'

interface ActionButtonsProps {
  project: Project
  onRunAlignment?: () => void
  onSyncRepo?: () => void
  onToggleExperimental?: () => void
  notificationCount?: number
  className?: string
}

export function ActionButtons({
  project,
  onRunAlignment,
  onSyncRepo,
  onToggleExperimental,
  notificationCount,
  className,
}: ActionButtonsProps) {
  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRunAlignment}
              disabled={!onRunAlignment}
              className="h-8 w-8"
            >
              <Play className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Run Alignment Check</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSyncRepo}
              disabled={!onSyncRepo}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sync Repository</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleExperimental}
                disabled={!onToggleExperimental}
                className="h-8 w-8"
              >
                <Zap className="h-4 w-4" />
              </Button>
              {project.experimental_mode && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  ON
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {project.experimental_mode ? 'Experimental Mode ON' : 'Experimental Mode OFF'}
          </TooltipContent>
        </Tooltip>

        {notificationCount !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <Bell className="h-4 w-4" />
                </Button>
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

