'use client'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  fields: React.ReactNode
  actions?: React.ReactNode
  divider?: boolean
  className?: string
}

export function FormSection({
  title,
  description,
  fields,
  actions,
  divider = true,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{fields}</div>
      {actions && (
        <div className="flex justify-end gap-2">{actions}</div>
      )}
      {divider && <Separator />}
    </div>
  )
}

