'use client'

import { usePathname } from 'next/navigation'
import { useProject } from '@/contexts/ProjectContext'
import { NavTabs } from './NavTabs'

export function NavTabsClient() {
  const pathname = usePathname()
  const { currentProject } = useProject()

  // Only show tabs when in a project context
  const projectPathMatch = pathname.match(/^\/projects\/([^/]+)/)
  const projectId = projectPathMatch ? projectPathMatch[1] : null

  // Use currentProject from context if available, otherwise extract from URL
  const activeProjectId = currentProject?.id || projectId

  if (!activeProjectId) {
    return null
  }

  return <NavTabs projectId={activeProjectId} currentPath={pathname} />
}

