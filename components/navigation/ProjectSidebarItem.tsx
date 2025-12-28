'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface SubItem {
  label: string
  href: string
}

interface ProjectSidebarItemProps {
  label: string
  icon: LucideIcon
  href: string
  subItems: SubItem[]
  currentPath: string
  projectId: string
}

export function ProjectSidebarItem({
  label,
  icon: Icon,
  href,
  subItems,
  currentPath,
  projectId,
}: ProjectSidebarItemProps) {
  const isActive = currentPath === href || currentPath.startsWith(href + '/')
  const hasActiveSubItem = subItems.some(
    (subItem) => currentPath === subItem.href || currentPath.startsWith(subItem.href + '/')
  )
  const shouldBeExpanded = isActive || hasActiveSubItem

  const [isExpanded, setIsExpanded] = useState(shouldBeExpanded)

  // Auto-expand if active
  useEffect(() => {
    if (shouldBeExpanded && !isExpanded) {
      setIsExpanded(true)
    }
  }, [shouldBeExpanded, isExpanded])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (subItems.length > 0) {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
    // If no sub-items, let the link navigate normally
  }

  return (
    <div className="mb-0.5">
      <div className="flex items-center group">
        {subItems.length > 0 && (
          <button
            onClick={handleToggle}
            className="w-4 h-6 flex items-center justify-center hover:bg-accent/50 transition-colors rounded-sm"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        )}
        {subItems.length === 0 && <div className="w-4" />}
        <Link
          href={href}
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors flex-1 min-w-0',
            isActive && !hasActiveSubItem
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      </div>

      {isExpanded && subItems.length > 0 && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {subItems.map((subItem) => {
            const isSubActive =
              currentPath === subItem.href || currentPath.startsWith(subItem.href + '/')

            return (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm transition-colors',
                  isSubActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <div className="w-4" />
                <span className="truncate">{subItem.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

