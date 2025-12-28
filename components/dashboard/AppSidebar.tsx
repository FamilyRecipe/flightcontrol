'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Settings, Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Projects',
    href: '/',
    icon: Home,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

const PINNED_STORAGE_KEY = 'sidebar-pinned'

export function AppSidebar() {
  const pathname = usePathname()
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Load pinned state from localStorage
    const savedPinned = localStorage.getItem(PINNED_STORAGE_KEY)
    if (savedPinned !== null) {
      setIsPinned(savedPinned === 'true')
    }
  }, [])

  const handlePinToggle = () => {
    const newPinnedState = !isPinned
    setIsPinned(newPinnedState)
    localStorage.setItem(PINNED_STORAGE_KEY, String(newPinnedState))
  }

  const isExpanded = isPinned || isHovered

  return (
    <aside
      className={cn(
        'border-r border-border bg-background flex flex-col transition-all duration-200 ease-in-out shrink-0',
        isExpanded ? 'w-56' : 'w-14'
      )}
      onMouseEnter={() => !isPinned && setIsHovered(true)}
      onMouseLeave={() => !isPinned && setIsHovered(false)}
    >
      <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {isExpanded ? 'Workspace' : ''}
      </div>
      <nav className="flex flex-col gap-0.5 flex-1 px-2 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-sm transition-colors relative group',
                isExpanded ? 'px-2 py-1.5' : 'justify-center w-10 h-10',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
              title={!isExpanded ? item.title : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap">{item.title}</span>
              )}
              {/* Tooltip on hover when collapsed */}
              {!isExpanded && (
                <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.title}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Pin button at bottom */}
      <div className="border-t border-border p-2">
        <button
          onClick={handlePinToggle}
          className={cn(
            'flex items-center gap-3 rounded-sm transition-colors relative group',
            isExpanded ? 'px-2 py-1.5 w-full' : 'justify-center w-10 h-10',
            'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
          title={!isExpanded ? (isPinned ? 'Unpin sidebar' : 'Pin sidebar') : undefined}
        >
          {isPinned ? (
            <Pin className="h-4 w-4 shrink-0" />
          ) : (
            <PinOff className="h-4 w-4 shrink-0" />
          )}
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">
              {isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            </span>
          )}
          {/* Tooltip on hover when collapsed */}
          {!isExpanded && (
            <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}

