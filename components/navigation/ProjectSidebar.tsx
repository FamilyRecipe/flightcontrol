'use client'

import {
  LayoutDashboard,
  FileText,
  GitBranch,
  MessageSquare,
  Settings,
} from 'lucide-react'
import { ProjectSidebarItem } from './ProjectSidebarItem'
import { cn } from '@/lib/utils'

interface ProjectSidebarProps {
  projectId: string
  currentPath: string
}

export function ProjectSidebar({ projectId, currentPath }: ProjectSidebarProps) {
  const projectNavItems = [
    {
      key: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      href: `/projects/${projectId}`,
      subItems: [
        { label: 'Dashboard', href: `/projects/${projectId}` },
        { label: 'Activity', href: `/projects/${projectId}/activity` },
        { label: 'Stats', href: `/projects/${projectId}/stats` },
      ],
    },
    {
      key: 'plan',
      label: 'Plan',
      icon: FileText,
      href: `/projects/${projectId}/plan`,
      subItems: [
        { label: 'Steps', href: `/projects/${projectId}/plan` },
        { label: 'Substeps', href: `/projects/${projectId}/plan/substeps` },
        { label: 'History', href: `/projects/${projectId}/plan/history` },
        { label: 'Updates', href: `/projects/${projectId}/plan/updates` },
      ],
    },
    {
      key: 'alignment',
      label: 'Alignment',
      icon: GitBranch,
      href: `/projects/${projectId}/alignment`,
      subItems: [
        { label: 'Dashboard', href: `/projects/${projectId}/alignment` },
        { label: 'Checks', href: `/projects/${projectId}/alignment/checks` },
        { label: 'Commits', href: `/projects/${projectId}/alignment/commits` },
        { label: 'Diff View', href: `/projects/${projectId}/alignment/diff` },
      ],
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      href: `/projects/${projectId}/chat`,
      subItems: [
        { label: 'Conversations', href: `/projects/${projectId}/chat/conversations` },
        { label: 'General Chat', href: `/projects/${projectId}/chat` },
        { label: 'History', href: `/projects/${projectId}/chat/history` },
      ],
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      href: `/projects/${projectId}/settings`,
      subItems: [
        { label: 'Project Settings', href: `/projects/${projectId}/settings` },
        { label: 'Webhooks', href: `/projects/${projectId}/settings/webhooks` },
        { label: 'Integrations', href: `/projects/${projectId}/settings/integrations` },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col w-60 border-r border-border bg-background',
        'transition-all duration-200 ease-in-out shrink-0'
      )}
    >
      <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Project
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {projectNavItems.map((item) => (
          <ProjectSidebarItem
            key={item.key}
            label={item.label}
            icon={item.icon}
            href={item.href}
            subItems={item.subItems}
            currentPath={currentPath}
            projectId={projectId}
          />
        ))}
      </nav>
    </aside>
  )
}

