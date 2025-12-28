'use client'

import { cn } from '@/lib/utils'

interface DiffViewerProps {
  before: string
  after: string
  language?: string
  variant?: 'side-by-side' | 'unified'
  highlightChanges?: boolean
  className?: string
}

export function DiffViewer({
  before,
  after,
  language,
  variant = 'side-by-side',
  highlightChanges = true,
  className,
}: DiffViewerProps) {
  // Simple diff viewer - shell implementation
  // Future: Add syntax highlighting and proper diff algorithm

  if (variant === 'unified') {
    return (
      <div className={cn('border rounded-lg p-4 font-mono text-sm', className)}>
        <pre className="whitespace-pre-wrap">
          <code>{before}</code>
        </pre>
        <div className="border-t my-4" />
        <pre className="whitespace-pre-wrap">
          <code>{after}</code>
        </pre>
      </div>
    )
  }

  // side-by-side variant (default)
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2">Before</div>
        <div className="border rounded-lg p-4 font-mono text-sm bg-muted/50">
          <pre className="whitespace-pre-wrap">
            <code>{before}</code>
          </pre>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2">After</div>
        <div className="border rounded-lg p-4 font-mono text-sm bg-muted/50">
          <pre className="whitespace-pre-wrap">
            <code>{after}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

