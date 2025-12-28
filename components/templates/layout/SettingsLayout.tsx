'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SettingsSection {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
}

interface SettingsLayoutProps {
  sections: SettingsSection[]
  activeSection: string
  children: React.ReactNode
  basePath?: string
}

export function SettingsLayout({
  sections,
  activeSection,
  children,
  basePath = '/settings',
}: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-56 shrink-0">
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon
            const href = section.href || `${basePath}#${section.id}`
            const isActive = activeSection === section.id

            return (
              <Link
                key={section.id}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{section.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}

