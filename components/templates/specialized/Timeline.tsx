'use client'

import { cn } from '@/lib/utils'

interface TimelineItem<T> {
  item: T
  timestamp: Date
  status?: 'success' | 'error' | 'warning' | 'neutral'
}

interface TimelineProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  getTimestamp: (item: T) => Date
  getStatus?: (item: T) => 'success' | 'error' | 'warning' | 'neutral'
  variant?: 'default' | 'compact'
  className?: string
}

const statusColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  neutral: 'bg-muted-foreground',
}

export function Timeline<T>({
  items,
  renderItem,
  getTimestamp,
  getStatus,
  variant = 'default',
  className,
}: TimelineProps<T>) {
  const sortedItems = [...items].sort(
    (a, b) => getTimestamp(b).getTime() - getTimestamp(a).getTime()
  )

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {sortedItems.map((item, index) => {
          const status = getStatus?.(item) || 'neutral'
          const timestamp = getTimestamp(item)

          return (
            <div key={index} className="relative flex gap-4">
              {/* Status Dot */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background',
                  statusColors[status]
                )}
              >
                <div className="h-2 w-2 rounded-full bg-background" />
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-6', variant === 'compact' && 'pb-3')}>
                <div className="text-xs text-muted-foreground mb-2">
                  {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
                </div>
                {renderItem(item)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

