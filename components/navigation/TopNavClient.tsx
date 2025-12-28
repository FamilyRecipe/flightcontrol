'use client'

import { usePathname } from 'next/navigation'
import { useProject } from '@/contexts/ProjectContext'
import type { User } from '@supabase/supabase-js'
import { TopNav } from './TopNav'

interface TopNavClientProps {
  user: User
  projects: any[] // Projects from server
}

export function TopNavClient({ user, projects: serverProjects }: TopNavClientProps) {
  const pathname = usePathname()
  const { currentProject, projects: contextProjects } = useProject()

  // Use context projects if available (they're synced with URL), otherwise use server projects
  const projects = contextProjects.length > 0 ? contextProjects : serverProjects

  return <TopNav user={user} currentProject={currentProject} projects={projects} />
}

