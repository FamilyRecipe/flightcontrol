'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary'
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  variant?: 'card' | 'inline' | 'center'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'card',
  className,
}: EmptyStateProps) {
  const content = (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center space-y-3 mb-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {action && (
            <>
              {action.href ? (
                <Link href={action.href}>
                  <Button size="lg" variant={action.variant || 'default'} className="w-full sm:w-auto">
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                  className="w-full sm:w-auto"
                >
                  {action.label}
                </Button>
              )}
            </>
          )}
          {secondaryAction && (
            <>
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button size="lg" variant={secondaryAction.variant || 'outline'} className="w-full sm:w-auto">
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  variant={secondaryAction.variant || 'outline'}
                  onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </>
  )

  if (variant === 'card') {
    return (
      <Card className={cn('border-2 border-dashed border-border', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          {content}
        </CardContent>
      </Card>
    )
  }

  if (variant === 'center') {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
        {content}
      </div>
    )
  }

  // inline variant
  return (
    <div className={cn('flex flex-col items-center justify-center py-8', className)}>
      {content}
    </div>
  )
}

