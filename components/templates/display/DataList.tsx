'use client'

import { EmptyState } from '../states/EmptyState'
import { LoadingState } from '../states/LoadingState'
import { cn } from '@/lib/utils'

interface DataListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyState?: React.ReactNode
  loading?: boolean
  variant?: 'grid' | 'list' | 'table'
  className?: string
}

export function DataList<T>({
  items,
  renderItem,
  emptyState,
  loading,
  variant = 'list',
  className,
}: DataListProps<T>) {
  if (loading) {
    return <LoadingState />
  }

  if (items.length === 0) {
    return emptyState || null
  }

  const containerClasses = {
    grid: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
    list: 'space-y-4',
    table: 'w-full',
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  )
}

