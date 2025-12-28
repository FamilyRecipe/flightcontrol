'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProject } from '@/contexts/ProjectContext'
import {
  Home,
  Settings,
  LayoutDashboard,
  FileText,
  GitBranch,
  MessageSquare,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

interface ProjectNavItem {
  key: string
  label: string
  icon: LucideIcon
  href: string
  subItems?: { label: string; href: string }[]
}

export function MainSidebar() {
  const pathname = usePathname()
  const { currentProject } = useProject()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Auto-expand sections that contain active items
  useEffect(() => {
    if (currentProject) {
      const projectPathMatch = pathname.match(/^\/projects\/([^/]+)/)
      if (projectPathMatch) {
        const activeProjectId = currentProject.id
        const projectNavItems = getProjectNavItems(activeProjectId)
        
        projectNavItems.forEach((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const hasActiveSubItem = item.subItems?.some(
            (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
          )
          if (isActive || hasActiveSubItem) {
            setExpandedSections((prev) => new Set(prev).add(item.key))
          }
        })
      }
    }
  }, [pathname, currentProject])

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const projectPathMatch = pathname.match(/^\/projects\/([^/]+)/)
  const projectId = projectPathMatch ? projectPathMatch[1] : null

  const navItems: NavItem[] = [
    { title: 'Projects', href: '/', icon: Home },
    { title: 'Settings', href: '/settings', icon: Settings },
  ]

  const getProjectNavItems = (projectId: string): ProjectNavItem[] => [
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
  ]

  const projectNavItems = projectId ? getProjectNavItems(projectId) : []

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col shrink-0 overflow-y-auto">
      {/* Workspace Section */}
      <div className="px-3 py-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Workspace
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Project Section */}
      {projectId && projectNavItems.length > 0 && (
        <div className="px-3 py-4 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Project
          </div>
          <nav className="flex flex-col gap-1">
            {projectNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const hasActiveSubItem = item.subItems?.some(
                (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
              )
              const isExpandedSection = expandedSections.has(item.key)

              return (
                <div key={item.key}>
                  <div className="flex items-center">
                    {item.subItems && item.subItems.length > 0 ? (
                      <button
                        onClick={() => toggleSection(item.key)}
                        className="w-6 h-8 flex items-center justify-center hover:bg-accent/50 transition-colors rounded-sm -ml-1"
                      >
                        {isExpandedSection ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      <div className="w-6" />
                    )}
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1',
                        (isActive && !hasActiveSubItem) || hasActiveSubItem
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </div>

                  {isExpandedSection && item.subItems && item.subItems.length > 0 && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {item.subItems.map((subItem) => {
                        const isSubActive =
                          pathname === subItem.href || pathname.startsWith(subItem.href + '/')

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
                              isSubActive
                                ? 'bg-accent text-foreground font-medium'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                            )}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      )}
    </aside>
  )
}

