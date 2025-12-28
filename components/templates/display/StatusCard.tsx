'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StatusCardProps {
  title: string
  description?: string
  icon: LucideIcon
  value?: string | number
  status?: 'success' | 'warning' | 'error' | 'neutral'
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  badge?: string
  onClick?: () => void
  className?: string
}

const statusColors = {
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  neutral: 'bg-primary/10 text-primary border-primary/20',
}

export function StatusCard({
  title,
  description,
  icon: Icon,
  value,
  status = 'neutral',
  action,
  badge,
  onClick,
  className,
}: StatusCardProps) {
  const cardContent = (
    <Card
      className={cn(
        'group transition-all hover:border-primary/50 hover:shadow-md h-full',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg transition-colors', statusColors[status])}>
            <Icon className="h-5 w-5" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {value !== undefined && (
          <div className="mt-2">
            <span className="text-2xl font-semibold">{value}</span>
          </div>
        )}
      </CardHeader>
      {action && (
        <CardContent>
          {action.href ? (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )

  return cardContent
}

