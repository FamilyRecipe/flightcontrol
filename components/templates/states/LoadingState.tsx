'use client'

import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingStateProps {
  message?: string
  variant?: 'spinner' | 'skeleton' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  message,
  variant = 'spinner',
  size = 'md',
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    )
  }

  // spinner variant (default)
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Loader2 className={cn('animate-spin mx-auto mb-4 text-primary', sizeClasses[size])} />
        {message && <p className="text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  )
}

