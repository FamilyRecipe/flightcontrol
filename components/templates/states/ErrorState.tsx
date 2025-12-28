'use client'

import { AlertCircle, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ErrorStateProps {
  error: string | Error
  retry?: () => void
  variant?: 'card' | 'inline' | 'banner'
  dismissible?: boolean
  className?: string
}

export function ErrorState({
  error,
  retry,
  variant = 'card',
  dismissible = false,
  className,
}: ErrorStateProps) {
  const [dismissed, setDismissed] = useState(false)
  const errorMessage = error instanceof Error ? error.message : error

  if (dismissed && dismissible) {
    return null
  }

  const content = (
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className={cn('text-destructive', variant === 'banner' && 'text-sm')}>{errorMessage}</p>
        {retry && variant !== 'banner' && (
          <Button onClick={retry} variant="outline" size="sm" className="mt-4">
            Retry
          </Button>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-destructive/10 border border-destructive/20 rounded-lg p-4',
          className
        )}
      >
        {content}
      </div>
    )
  }

  if (variant === 'inline') {
    return <div className={cn('py-4', className)}>{content}</div>
  }

  // card variant (default)
  return (
    <Card>
      <CardContent className="p-8">
        {content}
      </CardContent>
    </Card>
  )
}

