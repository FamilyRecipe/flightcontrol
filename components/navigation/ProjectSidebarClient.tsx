'use client'

import { usePathname } from 'next/navigation'
import { useProject } from '@/contexts/ProjectContext'
import { ProjectSidebar } from './ProjectSidebar'

export function ProjectSidebarClient() {
  const pathname = usePathname()
  const { currentProject } = useProject()

  // Only show sidebar when in a project context
  // Check if pathname matches /projects/[projectId] pattern
  const projectPathMatch = pathname.match(/^\/projects\/([^/]+)/)
  const projectId = projectPathMatch ? projectPathMatch[1] : null

  // Use currentProject from context if available, otherwise extract from URL
  const activeProjectId = currentProject?.id || projectId

  if (!activeProjectId) {
    return null
  }

  return <ProjectSidebar projectId={activeProjectId} currentPath={pathname} />
}

