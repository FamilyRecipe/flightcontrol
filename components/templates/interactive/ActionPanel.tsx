'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Action {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'destructive' | 'secondary'
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface ActionPanelProps {
  actions: Action[]
  position?: 'top' | 'bottom' | 'sticky'
  align?: 'left' | 'center' | 'right'
  variant?: 'bar' | 'floating'
  className?: string
}

export function ActionPanel({
  actions,
  position = 'sticky',
  align = 'right',
  variant = 'bar',
  className,
}: ActionPanelProps) {
  const positionClasses = {
    top: 'top-0',
    bottom: 'bottom-0',
    sticky: 'sticky top-0',
  }

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  const variantClasses = {
    bar: 'border-b bg-background/95 backdrop-blur',
    floating: 'bg-card border rounded-lg shadow-lg',
  }

  return (
    <div
      className={cn(
        'z-40 flex items-center gap-2 p-4',
        positionClasses[position],
        variantClasses[variant],
        className
      )}
    >
      <div className={cn('flex items-center gap-2 flex-1', alignClasses[align])}>
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

