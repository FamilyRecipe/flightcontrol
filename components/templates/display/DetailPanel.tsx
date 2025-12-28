'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
  title: string
  subtitle?: string
  isOpen: boolean
  onClose: () => void
  actions?: React.ReactNode
  variant?: 'drawer' | 'modal' | 'inline'
  children: React.ReactNode
  className?: string
}

export function DetailPanel({
  title,
  subtitle,
  isOpen,
  onClose,
  actions,
  variant = 'drawer',
  children,
  className,
}: DetailPanelProps) {
  if (variant === 'modal') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={className}>
          <DialogClose onClose={onClose} />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
          </DialogHeader>
          <div className="mt-4">
            {children}
          </div>
          {actions && (
            <div className="flex justify-end gap-2 mt-6">
              {actions}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  if (variant === 'inline') {
    if (!isOpen) return null
    return (
      <div className={cn('border rounded-lg p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    )
  }

  // drawer variant (default)
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className={cn('sm:max-w-lg', className)}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
        {actions && (
          <div className="flex justify-end gap-2 mt-6">
            {actions}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

