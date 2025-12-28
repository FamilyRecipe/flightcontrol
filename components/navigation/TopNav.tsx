'use client'

import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import type { Project } from '@/lib/db/queries'
import { FolderGit2 } from 'lucide-react'
import { ProjectSelector } from './ProjectSelector'
import { BranchSelector } from './BranchSelector'
import { ActionButtons } from './ActionButtons'
import { UserMenu } from './UserMenu'

interface TopNavProps {
  user: User
  currentProject: Project | null
  projects: Project[]
  currentPath?: string
}

export function TopNav({ user, currentProject, projects }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center gap-2 shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <FolderGit2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold sm:inline-block">FlightControl</span>
        </Link>

        {/* Project Selector */}
        <ProjectSelector
          currentProject={currentProject}
          projects={projects}
        />

        {/* Branch Selector (if project selected) */}
        {currentProject && (
          <BranchSelector project={currentProject} className="ml-2 hidden md:flex" />
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        {currentProject && (
          <ActionButtons project={currentProject} className="mr-2 hidden sm:flex" />
        )}

        {/* User Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  )
}

