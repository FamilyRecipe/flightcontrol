'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  GitCommit,
  MessageSquare,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavTab {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface NavTabsProps {
  projectId: string
  currentPath: string
}

export function NavTabs({ projectId, currentPath }: NavTabsProps) {
  const tabs: NavTab[] = [
    {
      label: 'Overview',
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
    },
    {
      label: 'Plan',
      href: `/projects/${projectId}/plan`,
      icon: FileText,
    },
    {
      label: 'Alignment',
      href: `/projects/${projectId}/alignment`,
      icon: GitBranch,
    },
    {
      label: 'Commits',
      href: `/projects/${projectId}/commits`,
      icon: GitCommit,
      disabled: true,
    },
    {
      label: 'Chat',
      href: `/projects/${projectId}/chat`,
      icon: MessageSquare,
    },
    {
      label: 'Settings',
      href: `/projects/${projectId}/settings`,
      icon: Settings,
      disabled: true,
    },
  ]

  return (
    <nav className="flex items-center gap-0.5">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive =
          currentPath === tab.href ||
          (tab.href !== `/projects/${projectId}` && currentPath.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            href={tab.disabled ? '#' : tab.href}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              'border-b-2 border-transparent',
              isActive
                ? 'text-foreground border-primary bg-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              tab.disabled && 'pointer-events-none opacity-40 cursor-not-allowed'
            )}
            onClick={(e) => tab.disabled && e.preventDefault()}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

