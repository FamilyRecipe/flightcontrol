'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface ComparisonViewProps {
  leftTitle: string
  leftContent: React.ReactNode
  rightTitle: string
  rightContent: React.ReactNode
  variant?: 'split' | 'tabs'
  className?: string
}

export function ComparisonView({
  leftTitle,
  leftContent,
  rightTitle,
  rightContent,
  variant = 'split',
  className,
}: ComparisonViewProps) {
  if (variant === 'tabs') {
    return (
      <Tabs defaultValue="left" className={className}>
        <TabsList>
          <TabsTrigger value="left">{leftTitle}</TabsTrigger>
          <TabsTrigger value="right">{rightTitle}</TabsTrigger>
        </TabsList>
        <TabsContent value="left" className="mt-4">
          {leftContent}
        </TabsContent>
        <TabsContent value="right" className="mt-4">
          {rightContent}
        </TabsContent>
      </Tabs>
    )
  }

  // split variant (default)
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-4">{leftTitle}</h3>
        <div className="border rounded-lg p-4">{leftContent}</div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">{rightTitle}</h3>
        <div className="border rounded-lg p-4">{rightContent}</div>
      </div>
    </div>
  )
}

