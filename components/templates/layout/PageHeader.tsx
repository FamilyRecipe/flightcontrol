'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  icon?: LucideIcon
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  icon: Icon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          {description && (
            <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

